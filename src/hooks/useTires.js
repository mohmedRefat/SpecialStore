import { useSupabaseTable } from './useSupabaseTable.js';
import { SEED } from '../data/seedData.js';
import { useToast } from '../context/ToastContext.jsx';

export function useTires() {
  const showToast = useToast();
  const {
    items: tires,
    setItems: setTires,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  } = useSupabaseTable('tires', SEED.tires);

  const addTire = async (form) => {
    const newTire = {
      id: 't' + Date.now(),
      brand: form.brand,
      origin: form.origin,
      size: form.size,
      qty: Number(form.qty) || 0,
      threshold: Number(form.threshold) || 2,
      cost: form.cost ? Number(form.cost) : null,
      wholesale: form.wholesale ? Number(form.wholesale) : null,
      retail: form.retail ? Number(form.retail) : null,
      place: '',
    };
    const { error } = await insertItem(newTire);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const adjustQty = async (id, delta) => {
    const item = tires.find((t) => t.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.qty || 0) + delta);
    const { error } = await updateItem(id, { qty: newQty });
    if (error) showToast('⚠️ فشل التحديث');
  };

  const deleteTire = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح الصنف ده؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { tires, setTires, loading, cloudMode, addTire, adjustQty, deleteTire };
}
