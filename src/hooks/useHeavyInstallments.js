import { useSupabaseTable } from './useSupabaseTable.js';
import { SEED } from '../data/seedData.js';
import { useToast } from '../context/ToastContext.jsx';
import { supabase, isCloudConfigured } from '../lib/supabaseClient.js';

const ACCOUNT_KIND = 'heavy';

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
    receivedDate: r.received_date || '',
    paymentDates: Array.isArray(r.payment_dates) ? r.payment_dates : [],
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
    received_date: c.receivedDate || null,
    payment_dates: c.paymentDates || [],
  };
}

export function useHeavyInstallments() {
  const showToast = useToast();
  const {
    items: heavyInstallments,
    setItems: setHeavyInstallments,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  } = useSupabaseTable('heavy_installments', SEED.heavyInstallments || [], { mapFromDb, mapToDb });

  const addHeavyInstallment = async (form) => {
    const total = Number(form.total) || 0;
    const down = Number(form.down) || 0;
    const remainingAfterDown = total - down;
    const installmentsCount = Number(form.installments) || 1;
    const paid = Number(form.paid) || 0;
    const monthly = Math.round(remainingAfterDown / installmentsCount);
    const remaining = remainingAfterDown - paid * monthly;
    const newC = {
      id: 'h' + Date.now(),
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
      receivedDate: form.receivedDate || '',
      paymentDates: [],
    };
    const { error } = await insertItem(newC);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const logPayment = async (id, amount) => {
    const c = heavyInstallments.find((x) => x.id === id);
    if (!c) return;
    const payAmount = amount !== undefined && amount !== null ? Number(amount) : Number(c.monthly);
    const newPaid = Number(c.paid) + 1;
    const newRemaining = Math.max(0, Number(c.remaining) - payAmount);
    const today = new Date().toISOString().slice(0, 10);
    const newPaymentDates = [...(c.paymentDates || []), today];
    const { error } = await updateItem(
      id,
      {
        paid: newPaid,
        remaining: newRemaining,
        lastPaymentDate: today,
        lastPaymentAmount: payAmount,
        paymentDates: newPaymentDates,
      },
      {
        paid: newPaid,
        remaining: newRemaining,
        last_payment_date: today,
        last_payment_amount: payAmount,
        payment_dates: newPaymentDates,
      }
    );
    if (error) {
      showToast('⚠️ فشل الحفظ');
      return;
    }
    showToast('✅ اتسجلت الدفعة');
  };

  const undoPayment = async (id) => {
    const c = heavyInstallments.find((x) => x.id === id);
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
    const newPaymentDates = [...(c.paymentDates || [])];
    newPaymentDates.pop();
    const { error } = await updateItem(
      id,
      { paid: newPaid, remaining: newRemaining, paymentDates: newPaymentDates },
      { paid: newPaid, remaining: newRemaining, payment_dates: newPaymentDates }
    );
    if (error) {
      showToast('⚠️ فشل التراجع');
      return;
    }
    showToast('↩️ اتلغت آخر دفعة');
  };

  const editInstallmentsCount = async (id, newCount) => {
    const c = heavyInstallments.find((x) => x.id === id);
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

  const deleteHeavyInstallment = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح العميل ده؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return {
    heavyInstallments,
    setHeavyInstallments,
    loading,
    cloudMode,
    addHeavyInstallment,
    logPayment,
    undoPayment,
    editInstallmentsCount,
    setFirstInstallmentDate,
    deleteHeavyInstallment,
  };
}