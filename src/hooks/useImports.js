import { useSupabaseTable } from './useSupabaseTable.js';
import { useToast } from '../context/ToastContext.jsx';

function mapFromDb(r) {
  return {
    id: r.id,
    itemDate: r.item_date,
    product: r.product,
    sizeOrAmp: r.size_or_amp,
    origin: r.origin,
    qty: r.qty,
    unitCost: r.unit_cost,
    totalCost: r.total_cost,
    supplier: r.supplier,
    notes: r.notes,
  };
}
function mapToDb(r) {
  return {
    id: r.id,
    item_date: r.itemDate,
    product: r.product,
    size_or_amp: r.sizeOrAmp,
    origin: r.origin,
    qty: r.qty,
    unit_cost: r.unitCost,
    total_cost: r.totalCost,
    supplier: r.supplier,
    notes: r.notes,
  };
}

export function useImports() {
  const showToast = useToast();
  const {
    items: imports,
    loading,
    cloudMode,
    insertItem,
    removeItem,
  } = useSupabaseTable('imports', [], { mapFromDb, mapToDb });

  const addImport = async (form) => {
    if (!form.product) {
      showToast('⚠️ اكتب اسم الصنف');
      return;
    }
    const qty = Number(form.qty) || 0;
    const unitCost = Number(form.unitCost) || 0;
    const newItem = {
      id: 'imp' + Date.now(),
      itemDate: form.date || new Date().toISOString().slice(0, 10),
      product: form.product,
      sizeOrAmp: form.sizeOrAmp || '',
      origin: form.origin || '',
      qty,
      unitCost,
      totalCost: qty * unitCost,
      supplier: form.supplier || '',
      notes: form.notes || '',
    };
    const { error } = await insertItem(newItem);
    if (error) {
      showToast('⚠️ فشل الحفظ');
      return;
    }
    showToast('✅ اتسجل الاستيراد');
  };

  const deleteImport = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح العملية دي؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { imports, loading, cloudMode, addImport, deleteImport };
}
