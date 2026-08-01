import { useSupabaseTable } from './useSupabaseTable.js';
import { useToast } from '../context/ToastContext.jsx';

function mapFromDb(r) {
  return {
    id: r.id,
    itemType: r.item_type,
    itemId: r.item_id,
    itemName: r.item_name,
    qty: r.qty,
    price: r.price,
    total: r.total,
    soldAt: r.sold_at,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
  };
}

function mapToDb(s) {
  return {
    id: s.id,
    item_type: s.itemType,
    item_id: s.itemId,
    item_name: s.itemName,
    qty: s.qty,
    price: s.price,
    total: s.total,
    sold_at: s.soldAt,
    customer_name: s.customerName || null,
    customer_phone: s.customerPhone || null,
  };
}

/**
 * useSales needs the other stock hooks so it can decrement quantity
 * automatically when a sale is logged.
 * usage: useSales({ tiresApi, batteriesApi, hardwareApi })
 */
export function useSales({ tiresApi, batteriesApi, hardwareApi }) {
  const showToast = useToast();
  const {
    items: sales,
    loading,
    cloudMode,
    insertItem,
    removeItem,
  } = useSupabaseTable('sales', [], { mapFromDb, mapToDb });

  const getCategoryApi = (type) => ({ tire: tiresApi, battery: batteriesApi, hardware: hardwareApi }[type]);
  const getCategoryItems = (type) =>
    ({ tire: tiresApi.tires, battery: batteriesApi.batteries, hardware: hardwareApi.hardware }[type]) || [];

  const addSale = async (form) => {
    const qty = Number(form.qty) || 0;
    const price = Number(form.price) || 0;

    if (!form.itemType || !form.itemId) {
      showToast('⚠️ اختار الصنف الأول');
      return;
    }
    if (qty <= 0) {
      showToast('⚠️ الكمية لازم تكون أكبر من صفر');
      return;
    }

    const items = getCategoryItems(form.itemType);
    const stockItem = items.find((i) => i.id === form.itemId);
    if (!stockItem) {
      showToast('⚠️ الصنف مش موجود');
      return;
    }
    if ((stockItem.qty || 0) < qty) {
      showToast('⚠️ الكمية المتاحة في المخزون مش كفاية');
      return;
    }

    const newSale = {
      id: 's' + Date.now(),
      itemType: form.itemType,
      itemId: form.itemId,
      itemName: stockItem.brand || stockItem.name,
      qty,
      price,
      total: qty * price,
      soldAt: form.date || new Date().toISOString().slice(0, 10),
      customerName: form.customerName || '',
      customerPhone: form.customerPhone || '',
    };

    const { error } = await insertItem(newSale);
    if (error) {
      showToast('⚠️ فشل تسجيل البيع');
      return;
    }

    const api = getCategoryApi(form.itemType);
    await api.adjustQty(form.itemId, -qty);
    showToast('✅ اتسجل البيع وخصم من المخزون');
  };

  const deleteSale = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح عملية البيع دي؟ (الكمية مش هترجع للمخزون تلقائي)')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { sales, loading, cloudMode, addSale, deleteSale };
}
