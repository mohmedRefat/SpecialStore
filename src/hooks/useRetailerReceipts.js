import { useSupabaseTable } from './useSupabaseTable.js';
import { useToast } from '../context/ToastContext.jsx';

function mapFromDb(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    amount: r.amount,
    desc: r.description,
    receivedAt: r.received_at,
    accountId: r.account_id,
  };
}
function mapToDb(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    amount: r.amount,
    description: r.desc,
    received_at: r.receivedAt,
    account_id: r.accountId || null,
  };
}

// نفس بالظبط منطق useReceipts.js، بس على جدول retailer_receipts المنفصل
export function useRetailerReceipts() {
  const showToast = useToast();
  const {
    items: receipts,
    loading,
    cloudMode,
    insertItem,
    removeItem,
  } = useSupabaseTable('retailer_receipts', [], { mapFromDb, mapToDb });

  const addReceipt = async (form) => {
    const amount = Number(form.amount) || 0;
    if (!form.name) {
      showToast('⚠️ اكتب اسم التاجر');
      return;
    }
    if (amount <= 0) {
      showToast('⚠️ المبلغ لازم يكون أكبر من صفر');
      return;
    }
    const newReceipt = {
      id: 'rrc' + Date.now(),
      name: form.name,
      phone: form.phone || '',
      amount,
      desc: form.desc || '',
      receivedAt: form.date || new Date().toISOString().slice(0, 10),
      accountId: form.accountId || null,
    };
    const { error } = await insertItem(newReceipt);
    if (error) {
      showToast('⚠️ فشل الحفظ');
      return;
    }
    showToast('✅ اتسجل استلام المبلغ');
  };

  const deleteReceipt = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح العملية دي؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { receipts, loading, cloudMode, addReceipt, deleteReceipt };
}
