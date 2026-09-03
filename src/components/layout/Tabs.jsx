const TABS = [
  { id: 'tires', label: '📦 المخزون' },
  { id: 'batteries', label: '🔋 البطاريات' },
  { id: 'hardware', label: '🔩 الحديد' },
  { id: 'loaders', label: '🚜 لودر وزراعي' },
  { id: 'sales', label: '💰 المبيعات' },
  { id: 'batterySales', label: '🔋 بيع البطاريات' },
  { id: 'receipts', label: '💵 استلام مبلغ' },
  { id: 'accounts', label: '📒 الحسابات' },
  { id: 'retailers', label: '🏪 تجار التجزئة' },
  { id: 'imports', label: '📥 الاستيراد' },
  { id: 'installments', label: '💳 تقسيط نص نقل' },
  { id: 'heavyInstallments', label: '🚛 تقسيط النقل التقيل' },
];

export default function Tabs({ activeTab, onChange }) {
  return (
    <div className="tabs">
      {TABS.map((t) => (
        <div
          key={t.id}
          className={`tab${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}