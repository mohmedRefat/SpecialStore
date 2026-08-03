import { useSupabaseTable } from './useSupabaseTable.js';
import { useToast } from '../context/ToastContext.jsx';

export function useLoaders() {
  const showToast = useToast();
  const {
    items: loaders,
    setItems: setLoaders,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  } = useSupabaseTable('loaders', []);

  const addLoader = async (form) => {
    const newItem = {
      id: 'ld' + Date.now(),
      brand: form.brand,
      origin: form.origin,
      size: form.size,
      qty: Number(form.qty) || 0,
      threshold: Number(form.threshold) || 1,
      cost: form.cost ? Number(form.cost) : null,
      wholesale: form.wholesale ? Number(form.wholesale) : null,
      retail: form.retail ? Number(form.retail) : null,
      place: form.place || '',
    };
    const { error } = await insertItem(newItem);
    if (error) showToast('⚠️ فشل الحفظ');
  };

  const adjustQty = async (id, delta) => {
    const item = loaders.find((l) => l.id === id);
    if (!item) return;
    const newQty = Math.max(0, (item.qty || 0) + delta);
    const { error } = await updateItem(id, { qty: newQty });
    if (error) showToast('⚠️ فشل التحديث');
  };

  const deleteLoader = async (id) => {
    if (!window.confirm('متأكد إنك عايز تمسح الصنف ده؟')) return;
    const { error } = await removeItem(id);
    if (error) showToast('⚠️ فشل الحذف');
  };

  return { loaders, setLoaders, loading, cloudMode, addLoader, adjustQty, deleteLoader };
}
