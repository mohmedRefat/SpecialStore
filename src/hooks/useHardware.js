import { useSupabaseTable } from './useSupabaseTable.js';
import { SEED } from '../data/seedData.js';
import { useToast } from '../context/ToastContext.jsx';

export function useHardware() {
  const showToast = useToast();
  const {
    items: hardware,
    setItems: setHardware,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  } = useSupabaseTable('hardware', SEED.hardware);

  const addHardware = async (form) => {
    const newItem = {
      id: 'h' + Date.now(),
      name: form.name,
      qty: Number(form.qty) || 0,
      cost: form.cost ? Number(form.cost) : null,
      wholesale: form.wholesale ? Number(form.wholesale) : null,
      retail: form.retail ? Number(form.retail) : null,
    };
    const { error } = await insertItem(newItem);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const adjustQty = async (id, delta) => {
    const item = hardware.find((h) => h.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.qty || 0) + delta);
    const { error } = await updateItem(id, { qty: newQty });
    if (error) showToast('⚠️ فشل التحديث');
  };

  const deleteHardware = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح الصنف ده؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { hardware, setHardware, loading, cloudMode, addHardware, adjustQty, deleteHardware };
}
