import { useSupabaseTable } from './useSupabaseTable.js';
import { useToast } from '../context/ToastContext.jsx';

function mapItemFromDb(r) {
  return {
    id: r.id,
    accountId: r.account_id,
    itemDate: r.item_date,
    product: r.product,
    sizeOrAmp: r.size_or_amp,
    origin: r.origin,
    price: r.price,
    qty: r.qty,
    total: r.total,
  };
}
function mapItemToDb(i) {
  return {
    id: i.id,
    account_id: i.accountId,
    item_date: i.itemDate,
    product: i.product,
    size_or_amp: i.sizeOrAmp,
    origin: i.origin,
    price: i.price,
    qty: i.qty,
    total: i.total,
  };
}

// نفس بالظبط منطق useAccounts.js، بس على جداول retailers/retailer_items المنفصلة
export function useRetailers() {
  const showToast = useToast();

  const {
    items: accounts,
    loading: accountsLoading,
    insertItem: insertAccount,
    removeItem: removeAccount,
  } = useSupabaseTable('retailers', []);

  const {
    items: accountItems,
    loading: itemsLoading,
    insertItem: insertItem_,
    removeItem: removeItem_,
  } = useSupabaseTable('retailer_items', [], { mapFromDb: mapItemFromDb, mapToDb: mapItemToDb });

  const addAccount = async (name) => {
    if (!name || !name.trim()) {
      showToast('⚠️ اكتب اسم التاجر');
      return;
    }
    const { error } = await insertAccount({ id: 'ret' + Date.now(), name: name.trim() });
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const deleteAccount = async (id) => {
    if (!window.confirm('متأكد؟ هيتمسح دفتر التاجر بكل حركاته.')) return;
    const { error } = await removeAccount(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  const addAccountItem = async (accountId, form) => {
    const qty = Number(form.qty) || 1;
    const price = Number(form.price) || 0;
    const newItem = {
      id: 'rti' + Date.now(),
      accountId,
      itemDate: form.date || new Date().toISOString().slice(0, 10),
      product: form.product,
      sizeOrAmp: form.sizeOrAmp || '',
      origin: form.origin || '',
      price,
      qty,
      total: qty * price,
    };
    const { error } = await insertItem_(newItem);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const deleteAccountItem = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح الحركة دي؟')) return;
    const { error } = await removeItem_(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  const itemsFor = (accountId) => accountItems.filter((i) => i.accountId === accountId);

  return {
    accounts,
    loading: accountsLoading || itemsLoading,
    addAccount,
    deleteAccount,
    itemsFor,
    addAccountItem,
    deleteAccountItem,
  };
}
