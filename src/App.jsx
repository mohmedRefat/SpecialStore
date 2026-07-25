import { useState } from 'react';
import Header from './components/layout/Header.jsx';
import Tabs from './components/layout/Tabs.jsx';
import Modal from './components/layout/Modal.jsx';
import TireList from './components/tires/TireList.jsx';
import TireForm from './components/tires/TireForm.jsx';
import BatteryList from './components/batteries/BatteryList.jsx';
import BatteryForm from './components/batteries/BatteryForm.jsx';
import InstallmentList from './components/installments/InstallmentList.jsx';
import InstallmentForm from './components/installments/InstallmentForm.jsx';
import InstallmentDateForm from './components/installments/InstallmentDateForm.jsx';
import { useTires } from './hooks/useTires.js';
import { useBatteries } from './hooks/useBatteries.js';
import { useInstallments } from './hooks/useInstallments.js';
import { useToast } from './context/ToastContext.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('tires');
  const [modal, setModal] = useState(null); // { type, payload }
  const showToast = useToast();

  const tiresApi = useTires();
  const batteriesApi = useBatteries();
  const installmentsApi = useInstallments();

  const isLoading = tiresApi.loading || batteriesApi.loading || installmentsApi.loading;
  const closeModal = () => setModal(null);

  const handleExport = () => {
    const payload = {
      tires: tiresApi.tires,
      batteries: batteriesApi.batteries,
      installments: installmentsApi.installments,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'نسخة_احتياطية_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ اتحمّل الملف');
  };

  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported.tires || !imported.batteries || !imported.installments) {
          throw new Error('bad file');
        }
        tiresApi.setTires(imported.tires);
        batteriesApi.setBatteries(imported.batteries);
        installmentsApi.setInstallments(imported.installments);
        showToast('✅ اتحمّلت البيانات بنجاح');
      } catch {
        showToast('⚠️ الملف مش صالح');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Header onExport={handleExport} onImportFile={handleImportFile} />
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <main>
        {isLoading ? (
          <div className="empty">جاري التحميل...</div>
        ) : (
          <>
            {activeTab === 'tires' && (
              <TireList
                tires={tiresApi.tires}
                onAdjust={tiresApi.adjustQty}
                onDelete={tiresApi.deleteTire}
                onOpenAdd={() => setModal({ type: 'tireForm' })}
              />
            )}
            {activeTab === 'batteries' && (
              <BatteryList
                batteries={batteriesApi.batteries}
                onAdjust={batteriesApi.adjustQty}
                onDelete={batteriesApi.deleteBattery}
                onOpenAdd={() => setModal({ type: 'batteryForm' })}
              />
            )}
            {activeTab === 'installments' && (
              <InstallmentList
                installments={installmentsApi.installments}
                onLogPayment={installmentsApi.logPayment}
                onUndoPayment={installmentsApi.undoPayment}
                onOpenDateForm={(id) => setModal({ type: 'installmentDateForm', payload: id })}
                onOpenAdd={() => setModal({ type: 'installmentForm' })}
              />
            )}
          </>
        )}
      </main>

      <Modal open={!!modal} onClose={closeModal}>
        {modal?.type === 'tireForm' && <TireForm onSave={tiresApi.addTire} onClose={closeModal} />}
        {modal?.type === 'batteryForm' && (
          <BatteryForm onSave={batteriesApi.addBattery} onClose={closeModal} />
        )}
        {modal?.type === 'installmentForm' && (
          <InstallmentForm onSave={installmentsApi.addInstallment} onClose={closeModal} />
        )}
        {modal?.type === 'installmentDateForm' && (
          <InstallmentDateForm
            installment={installmentsApi.installments.find((c) => c.id === modal.payload)}
            onSave={(date) => installmentsApi.setFirstInstallmentDate(modal.payload, date)}
            onClose={closeModal}
          />
        )}
      </Modal>
    </>
  );
}
