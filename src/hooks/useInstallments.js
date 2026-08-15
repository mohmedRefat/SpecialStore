import { useSupabaseTable } from './useSupabaseTable.js';
import { SEED } from '../data/seedData.js';
import { useToast } from '../context/ToastContext.jsx';
import { supabase, isCloudConfigured } from '../lib/supabaseClient.js';

const ACCOUNT_KIND = 'regular';

function mapFromDb(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    desc: r.description,
    total: r.total,
    down: r.down,
    installments: r.installments,
    monthly: r.monthly,
    paid: r.paid,
    remaining: r.remaining,
    firstInstallmentDate: r.first_installment_date || '',
    lastPaymentDate: r.last_payment_date || '',
    frequency: r.frequency || 'monthly',
  };
}

function mapToDb(c) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    description: c.desc,
    total: c.total,
    down: c.down,
    installments: c.installments,
    monthly: c.monthly,
    paid: c.paid,
    remaining: c.remaining,
    first_installment_date: c.firstInstallmentDate || null,
    last_payment_date: c.lastPaymentDate || null,
    frequency: c.frequency || 'monthly',
  };
}

export function useInstallments() {
  const showToast = useToast();
  const {
    items: installments,
    setItems: setInstallments,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  } = useSupabaseTable('installments', SEED.installments, { mapFromDb, mapToDb });

  const addInstallment = async (form) => {
    const total = Number(form.total) || 0;
    const down = Number(form.down) || 0;
    const remainingAfterDown = total - down;
    const installmentsCount = Number(form.installments) || 1;
    const paid = Number(form.paid) || 0;
    const monthly = Math.round(remainingAfterDown / installmentsCount);
    const remaining = remainingAfterDown - paid * monthly;
    const newC = {
      id: 'c' + Date.now(),
      name: form.name,
      phone: form.phone,
      desc: form.desc,
      total,
      down,
      remaining,
      installments: installmentsCount,
      paid,
      monthly,
      firstInstallmentDate: form.date || '',
      lastPaymentDate: '',
      frequency: form.frequency || 'monthly',
    };
    const { error } = await insertItem(newC);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  // كل دفعة بتتسجل كصف منفصل في installment_payments، مش رقم واحد بيتكتب فوق نفسه —
  // ده اللي بيخلي "تراجع" يشتغل صح حتى لو استخدمته أكتر من مرة ورا بعض
  const logPayment = async (id, amount) => {
    const c = installments.find((x) => x.id === id);
    if (!c) return;
    const payAmount = amount !== undefined && amount !== null ? Number(amount) : Number(c.monthly);
    const newPaid = Number(c.paid) + 1;
    const newRemaining = Math.max(0, Number(c.remaining) - payAmount);
    const today = new Date().toISOString().slice(0, 10);

    if (cloudMode && isCloudConfigured) {
      const { error: logError } = await supabase.from('installment_payments').insert({
        id: 'pay' + Date.now() + Math.floor(Math.random() * 1000),
        account_id: id,
        account_kind: ACCOUNT_KIND,
        amount: payAmount,
        paid_at: today,
      });
      if (logError) {
        showToast('⚠️ فشل حفظ سجل الدفعة');
        return;
      }
    }

    const { error } = await updateItem(
      id,
      { paid: newPaid, remaining: newRemaining, lastPaymentDate: today },
      { paid: newPaid, remaining: newRemaining, last_payment_date: today }
    );
    if (error) {
      showToast('⚠️ فشل الحفظ');
      return;
    }
    showToast('✅ اتسجلت الدفعة');
  };

  // بيدوّر على آخر دفعة فعلية اتسجلت في السجل ويشيلها، ويرجّع مبلغها بالظبط —
  // مش رقم ثابت مخزّن، فبيفضل شغال صح مهما كررت التراجع
  const undoPayment = async (id) => {
    const c = installments.find((x) => x.id === id);
    if (!c || c.paid <= 0) return;

    let restoreAmount = Number(c.monthly);
    let newLastPaymentDate = c.lastPaymentDate;

    if (cloudMode && isCloudConfigured) {
      const { data: rows, error: fetchErr } = await supabase
        .from('installment_payments')
        .select('*')
        .eq('account_id', id)
        .eq('account_kind', ACCOUNT_KIND)
        .order('created_at', { ascending: false })
        .limit(1);
      if (fetchErr) {
        showToast('⚠️ فشل التراجع');
        return;
      }
      if (rows && rows.length > 0) {
        const last = rows[0];
        restoreAmount = Number(last.amount);
        await supabase.from('installment_payments').delete().eq('id', last.id);

        const { data: prevRows } = await supabase
          .from('installment_payments')
          .select('*')
          .eq('account_id', id)
          .eq('account_kind', ACCOUNT_KIND)
          .order('created_at', { ascending: false })
          .limit(1);
        newLastPaymentDate = prevRows && prevRows.length > 0 ? prevRows[0].paid_at : '';
      }
    }

    const newPaid = Number(c.paid) - 1;
    const newRemaining = Number(c.remaining) + restoreAmount;

    const { error } = await updateItem(
      id,
      { paid: newPaid, remaining: newRemaining, lastPaymentDate: newLastPaymentDate },
      { paid: newPaid, remaining: newRemaining, last_payment_date: newLastPaymentDate || null }
    );
    if (error) {
      showToast('⚠️ فشل التراجع');
      return;
    }
    showToast('↩️ اتلغت آخر دفعة');
  };

  // للعميل اللي بيدفع بشكل غير منتظم — تقدر تزوّد عدد الأقساط في أي وقت
  const editInstallmentsCount = async (id, newCount) => {
    const c = installments.find((x) => x.id === id);
    if (!c) return;
    const count = Math.max(1, Number(newCount) || 1);
    const remainingAfterDown = Number(c.total) - Number(c.down);
    const newMonthly = Math.round(remainingAfterDown / count);
    const { error } = await updateItem(
      id,
      { installments: count, monthly: newMonthly },
      { installments: count, monthly: newMonthly }
    );
    if (error) {
      showToast('⚠️ فشل التعديل');
      return;
    }
    showToast('✅ اتعدّل عدد الأقساط');
  };

  const setFirstInstallmentDate = async (id, date) => {
    const { error } = await updateItem(
      id,
      { firstInstallmentDate: date },
      { first_installment_date: date || null }
    );
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const deleteInstallment = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح العميل ده؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return {
    installments,
    setInstallments,
    loading,
    cloudMode,
    addInstallment,
    logPayment,
    undoPayment,
    editInstallmentsCount,
    setFirstInstallmentDate,
    deleteInstallment,
  };
}