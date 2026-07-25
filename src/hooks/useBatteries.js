import { useSupabaseTable } from './useSupabaseTable.js';
import { SEED } from '../data/seedData.js';
import { useToast } from '../context/ToastContext.jsx';

export function useBatteries() {
  const showToast = useToast();
  const {
    items: batteries,
    setItems: setBatteries,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  } = useSupabaseTable('batteries', SEED.batteries);

  const addBattery = async (form) => {
    const newBattery = {
      id: 'b' + Date.now(),
      brand: form.brand,
      origin: form.origin,
      amp: Number(form.amp) || 0,
      qty: Number(form.qty) || 0,
      cost: form.cost ? Number(form.cost) : null,
      wholesale: form.wholesale ? Number(form.wholesale) : null,
      retail: form.retail ? Number(form.retail) : null,
    };
    const { error } = await insertItem(newBattery);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const adjustQty = async (id, delta) => {
    const item = batteries.find((b) => b.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.qty || 0) + delta);
    const { error } = await updateItem(id, { qty: newQty });
    if (error) showToast('⚠️ فشل التحديث');
  };

  const deleteBattery = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح الصنف ده؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { batteries, setBatteries, loading, cloudMode, addBattery, adjustQty, deleteBattery };
}
