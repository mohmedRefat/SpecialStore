import InstallmentForm from '../installments/InstallmentForm.jsx';

export default function HeavyInstallmentForm(props) {
  return (
    <InstallmentForm
      {...props}
      title="🚛 عميل نقل تقيل جديد"
      placeholder={'مثال:\n6 كاوتش نقل 750/16\n2 بطارية 200 أمبير'}
    />
  );
}
