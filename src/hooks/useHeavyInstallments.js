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
    lastPaymentAmount: r.last_payment_amount ?? null,
    frequency: r.frequency || 'monthly',
    receivedDate: r.received_date || '',
    paymentDates: Array.isArray(r.payment_dates) ? r.payment_dates : [],
    paymentAmounts: Array.isArray(r.payment_amounts) ? r.payment_amounts : [],
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
    last_payment_amount: c.lastPaymentAmount ?? null,
    frequency: c.frequency || 'monthly',
    received_date: c.receivedDate || null,
    payment_dates: c.paymentDates || [],
    payment_amounts: c.paymentAmounts || [],
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
      lastPaymentAmount: null,
      frequency: form.frequency || 'monthly',
      receivedDate: form.receivedDate || '',
      paymentDates: [],
      paymentAmounts: [],
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
    const newPaymentAmounts = [...(c.paymentAmounts || []), payAmount];
    const { error } = await updateItem(
      id,
      {
        paid: newPaid,
        remaining: newRemaining,
        lastPaymentDate: today,
        lastPaymentAmount: payAmount,
        paymentDates: newPaymentDates,
        paymentAmounts: newPaymentAmounts,
      },
      {
        paid: newPaid,
        remaining: newRemaining,
        last_payment_date: today,
        last_payment_amount: payAmount,
        payment_dates: newPaymentDates,
        payment_amounts: newPaymentAmounts,
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
    const amounts = [...(c.paymentAmounts || [])];
    const dates = [...(c.paymentDates || [])];
    const restoreAmount = amounts.length > 0 ? Number(amounts.pop()) : Number(c.monthly);
    dates.pop();
    const newPaid = Number(c.paid) - 1;
    const newRemaining = Number(c.remaining) + restoreAmount;
    const newLastAmount = amounts.length > 0 ? amounts[amounts.length - 1] : null;
    const newLastDate = dates.length > 0 ? dates[dates.length - 1] : '';
    const { error } = await updateItem(
      id,
      {
        paid: newPaid,
        remaining: newRemaining,
        paymentDates: dates,
        paymentAmounts: amounts,
        lastPaymentDate: newLastDate,
        lastPaymentAmount: newLastAmount,
      },
      {
        paid: newPaid,
        remaining: newRemaining,
        payment_dates: dates,
        payment_amounts: amounts,
        last_payment_date: newLastDate || null,
        last_payment_amount: newLastAmount,
      }
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