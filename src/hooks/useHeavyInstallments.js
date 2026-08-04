import { useSupabaseTable } from './useSupabaseTable.js';
import { SEED } from '../data/seedData.js';
import { useToast } from '../context/ToastContext.jsx';

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

// نفس بالظبط منطق useInstallments.js، بس على جدول heavy_installments المنفصل
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
    };
    const { error } = await insertItem(newC);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const logPayment = async (id) => {
    const c = heavyInstallments.find((x) => x.id === id);
    if (!c) return;
    const newPaid = Number(c.paid) + 1;
    const newRemaining = Math.max(0, Number(c.remaining) - Number(c.monthly));
    const today = new Date().toISOString().slice(0, 10);
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

  const undoPayment = async (id) => {
    const c = heavyInstallments.find((x) => x.id === id);
    if (!c || c.paid <= 0) return;
    const newPaid = Number(c.paid) - 1;
    const newRemaining = Number(c.remaining) + Number(c.monthly);
    const { error } = await updateItem(
      id,
      { paid: newPaid, remaining: newRemaining },
      { paid: newPaid, remaining: newRemaining }
    );
    if (error) {
      showToast('⚠️ فشل التراجع');
      return;
    }
    showToast('↩️ اتلغت آخر دفعة');
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
    setFirstInstallmentDate,
    deleteHeavyInstallment,
  };
}
