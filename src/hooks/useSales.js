import { useSupabaseTable } from './useSupabaseTable.js';
import { useToast } from '../context/ToastContext.jsx';

function mapFromDb(r) {
  return {
    id: r.id,
    invoiceNo: r.invoice_no,
    itemType: r.item_type,
    itemId: r.item_id,
    itemName: r.item_name,
    qty: r.qty,
    price: r.price,
    total: r.total,
    paidAmount: r.paid_amount,
    soldAt: r.sold_at,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    paymentMethod: r.payment_method,
    soldBy: r.sold_by,
    notes: r.notes,
    createdAt: r.created_at,
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
    paid_amount: s.paidAmount,
    sold_at: s.soldAt,
    customer_name: s.customerName || null,
    customer_phone: s.customerPhone || null,
    payment_method: s.paymentMethod || 'cash',
    sold_by: s.soldBy || null,
    notes: s.notes || null,
  };
}

/**
 * usage: useSales({ tiresApi, batteriesApi, hardwareApi, loadersApi, currentUserEmail })
 */
export function useSales({ tiresApi, batteriesApi, hardwareApi, loadersApi, currentUserEmail }) {
  const showToast = useToast();
  const {
    items: sales,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  } = useSupabaseTable('sales', [], { mapFromDb, mapToDb });

  const getCategoryApi = (type) =>
    ({ tire: tiresApi, battery: batteriesApi, hardware: hardwareApi, loader: loadersApi }[type]);
  const getCategoryItems = (type) =>
    ({
      tire: tiresApi.tires,
      battery: batteriesApi.batteries,
      hardware: hardwareApi.hardware,
      loader: loadersApi?.loaders,
    }[type]) || [];

  const addSale = async (form) => {
    const qty = Number(form.qty) || 0;
    const price = Number(form.price) || 0;
    const total = qty * price;
    const paidAmount = form.paidAmount === '' || form.paidAmount === undefined ? total : Number(form.paidAmount);

    if (qty <= 0) {
      showToast('⚠️ الكمية لازم تكون أكبر من صفر');
      return;
    }

    // وضع الكتابة اليدوي: مفيش صنف مربوط بالمخزون، فمفيش خصم أوتوماتيك
    const isManual = form.mode === 'manual' || !form.itemId;

    let itemName = '';
    let stockItem = null;

    if (!isManual) {
      if (!form.itemType || !form.itemId) {
        showToast('⚠️ اختار الصنف الأول');
        return;
      }
      const items = getCategoryItems(form.itemType);
      stockItem = items.find((i) => i.id === form.itemId);
      if (!stockItem) {
        showToast('⚠️ الصنف مش موجود');
        return;
      }
      if ((stockItem.qty || 0) < qty) {
        showToast('⚠️ الكمية المتاحة في المخزون مش كفاية');
        return;
      }
      itemName = stockItem.brand || stockItem.name;
    } else {
      itemName = (form.manualItemName || '').trim();
      if (!itemName) {
        showToast('⚠️ اكتب اسم/بيان الصنف');
        return;
      }
    }

    const newSale = {
      id: 's' + Date.now(),
      itemType: form.itemType || 'manual',
      itemId: isManual ? null : form.itemId,
      itemName,
      qty,
      price,
      total,
      paidAmount,
      soldAt: form.date || new Date().toISOString().slice(0, 10),
      customerName: form.customerName || '',
      customerPhone: form.customerPhone || '',
      paymentMethod: form.paymentMethod || 'cash',
      soldBy: currentUserEmail || '',
      notes: form.notes || '',
    };

    const { error } = await insertItem(newSale);
    if (error) {
      showToast('⚠️ فشل تسجيل البيع');
      return;
    }

    if (!isManual) {
      const api = getCategoryApi(form.itemType);
      await api.adjustQty(form.itemId, -qty);
      showToast('✅ اتسجل البيع وخصم من المخزون');
    } else {
      showToast('✅ اتسجل البيع (يدوي - من غير خصم من المخزون)');
    }
  };

  const updateSale = async (id, patch) => {
    const dbPatch = {};
    if ('customerName' in patch) dbPatch.customer_name = patch.customerName || null;
    if ('customerPhone' in patch) dbPatch.customer_phone = patch.customerPhone || null;
    if ('price' in patch) dbPatch.price = patch.price;
    if ('total' in patch) dbPatch.total = patch.total;
    if ('paidAmount' in patch) dbPatch.paid_amount = patch.paidAmount;
    if ('paymentMethod' in patch) dbPatch.payment_method = patch.paymentMethod;
    if ('notes' in patch) dbPatch.notes = patch.notes || null;

    const { error } = await updateItem(id, patch, dbPatch);
    if (error) {
      showToast('⚠️ فشل التعديل');
      return;
    }
    showToast('✅ اتعدّلت البيانات');
  };

  const deleteSale = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح عملية البيع دي؟ (الكمية مش هترجع للمخزون تلقائي)')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { sales, loading, cloudMode, addSale, updateSale, deleteSale };
}