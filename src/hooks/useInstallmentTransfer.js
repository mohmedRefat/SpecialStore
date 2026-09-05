import { supabase, isCloudConfigured } from '../lib/supabaseClient.js';
import { useToast } from '../context/ToastContext.jsx';

const TABLE = { light: 'installments', heavy: 'heavy_installments' };

// بينقل عميل بين جدول التقسيط العادي وجدول النقل التقيل بأمان:
// 1) بيجيب الصف الحقيقي من قاعدة البيانات (مش من الذاكرة) بكل تفاصيله
// 2) بينسخه في الجدول التاني الأول
// 3) بيمسحه من الجدول الأصلي بس لو النسخ نجح فعلاً
// أي فشل في أي خطوة = العميل بيفضل في مكانه الأصلي، مفيش احتمال يضيع
export function useInstallmentTransfer() {
  const showToast = useToast();

  const moveInstallment = async (record, fromKind, toKind) => {
    if (!isCloudConfigured) {
      showToast('⚠️ النقل بين القوائم متاح بس لما تكون متصل بـ Supabase');
      return false;
    }
    const fromTable = TABLE[fromKind];
    const toTable = TABLE[toKind];
    if (!fromTable || !toTable || fromTable === toTable) return false;

    const { data: row, error: fetchErr } = await supabase
      .from(fromTable)
      .select('*')
      .eq('id', record.id)
      .single();
    if (fetchErr || !row) {
      showToast('⚠️ فشل جلب بيانات العميل — اتلغت العملية من غير أي تغيير');
      return false;
    }

    const { error: insertErr } = await supabase.from(toTable).insert(row);
    if (insertErr) {
      showToast('⚠️ فشل نقل العميل — البيانات لسه موجودة في مكانها الأصلي زي ما هي');
      return false;
    }

    const { error: deleteErr } = await supabase.from(fromTable).delete().eq('id', record.id);
    if (deleteErr) {
      showToast('⚠️ العميل اتنسخ في المكان الجديد بس فشل حذفه من القديم — راجع الاتنين يدويًا عشان مايتكررش');
      return false;
    }

    showToast('✅ اتنقل العميل بنجاح');
    return true;
  };

  return { moveInstallment };
}
