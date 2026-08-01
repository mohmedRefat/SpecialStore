import { useState } from "react";
import HardwareList from "./components/hardware/HardwareList.jsx";
import HardwareForm from "./components/hardware/HardwareForm.jsx";
import { useHardware } from "./hooks/useHardware.js";
import SalesList from "./components/sales/SalesList.jsx";
import SalesForm from "./components/sales/SalesForm.jsx";
import { useSales } from "./hooks/useSales.js";
import ReceiptList from "./components/receipts/ReceiptList.jsx";
import ReceiptForm from "./components/receipts/ReceiptForm.jsx";
import { useReceipts } from "./hooks/useReceipts.js";
import Header from "./components/layout/Header.jsx";
import Tabs from "./components/layout/Tabs.jsx";
import Modal from "./components/layout/Modal.jsx";
import TireList from "./components/tires/TireList.jsx";
import TireForm from "./components/tires/TireForm.jsx";
import BatteryList from "./components/batteries/BatteryList.jsx";
import BatteryForm from "./components/batteries/BatteryForm.jsx";
import InstallmentList from "./components/installments/InstallmentList.jsx";
import InstallmentForm from "./components/installments/InstallmentForm.jsx";
import InstallmentDateForm from "./components/installments/InstallmentDateForm.jsx";
import { useTires } from "./hooks/useTires.js";
import { useBatteries } from "./hooks/useBatteries.js";
import { useInstallments } from "./hooks/useInstallments.js";
import { useToast } from "./context/ToastContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { isCloudConfigured } from "./lib/supabaseClient.js";
import LoginForm from "./components/auth/LoginForm.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("tires");
  const [modal, setModal] = useState(null); // { type, payload }
  const showToast = useToast();
  const { user, loading: authLoading, signOut } = useAuth();

  const tiresApi = useTires();
  const batteriesApi = useBatteries();
  const installmentsApi = useInstallments();
  const hardwareApi = useHardware();
  const salesApi = useSales({ tiresApi, batteriesApi, hardwareApi });
  const receiptsApi = useReceipts();

  const isLoading =
    tiresApi.loading ||
    batteriesApi.loading ||
    installmentsApi.loading ||
    hardwareApi.loading;
  const closeModal = () => setModal(null);

  // لو Supabase متظبط وفيه auth مفعّل، لازم تسجّل دخول قبل ما تشوف أي حاجة
  if (isCloudConfigured && authLoading) {
    return <div className="empty">...جاري التحقق من الدخول</div>;
  }
  if (isCloudConfigured && !user) {
    return <LoginForm />;
  }

  const handleExport = () => {
    const payload = {
      tires: tiresApi.tires,
      batteries: batteriesApi.batteries,
      installments: installmentsApi.installments,
      hardware: hardwareApi.hardware,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "نسخة_احتياطية_" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ اتحمّل الملف");
  };

  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported.tires || !imported.batteries || !imported.installments) {
          throw new Error("bad file");
        }
        tiresApi.setTires(imported.tires);
        batteriesApi.setBatteries(imported.batteries);
        installmentsApi.setInstallments(imported.installments);
        if (imported.hardware) {
          hardwareApi.setHardware(imported.hardware);
        }
        showToast("✅ اتحمّلت البيانات بنجاح");
      } catch {
        showToast("⚠️ الملف مش صالح");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Header
        onExport={handleExport}
        onImportFile={handleImportFile}
        onLogout={isCloudConfigured ? signOut : null}
        userEmail={user?.email}
      />
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <main>
        {isLoading ? (
          <div className="empty">جاري التحميل...</div>
        ) : (
          <>
            {activeTab === "tires" && (
              <TireList
                tires={tiresApi.tires}
                onAdjust={tiresApi.adjustQty}
                onDelete={tiresApi.deleteTire}
                onOpenAdd={() => setModal({ type: "tireForm" })}
              />
            )}
            {activeTab === "batteries" && (
              <BatteryList
                batteries={batteriesApi.batteries}
                onAdjust={batteriesApi.adjustQty}
                onDelete={batteriesApi.deleteBattery}
                onOpenAdd={() => setModal({ type: "batteryForm" })}
              />
            )}
            {activeTab === "hardware" && (
              <HardwareList
                hardware={hardwareApi.hardware}
                onAdjust={hardwareApi.adjustQty}
                onDelete={hardwareApi.deleteHardware}
                onOpenAdd={() => setModal({ type: "hardwareForm" })}
              />
            )}
            {activeTab === "sales" && (
              <SalesList
                sales={salesApi.sales}
                onDelete={salesApi.deleteSale}
                onOpenAdd={() => setModal({ type: "salesForm" })}
              />
            )}
            {activeTab === "receipts" && (
              <ReceiptList
                receipts={receiptsApi.receipts}
                onDelete={receiptsApi.deleteReceipt}
                onOpenAdd={() => setModal({ type: "receiptForm" })}
              />
            )}
            {activeTab === "installments" && (
              <InstallmentList
                installments={installmentsApi.installments}
                onLogPayment={installmentsApi.logPayment}
                onUndoPayment={installmentsApi.undoPayment}
                onOpenDateForm={(id) =>
                  setModal({ type: "installmentDateForm", payload: id })
                }
                onOpenAdd={() => setModal({ type: "installmentForm" })}
              />
            )}
          </>
        )}
      </main>

      <Modal open={!!modal} onClose={closeModal}>
        {modal?.type === "tireForm" && (
          <TireForm onSave={tiresApi.addTire} onClose={closeModal} />
        )}
        {modal?.type === "batteryForm" && (
          <BatteryForm onSave={batteriesApi.addBattery} onClose={closeModal} />
        )}
        {modal?.type === "hardwareForm" && (
          <HardwareForm onSave={hardwareApi.addHardware} onClose={closeModal} />
        )}
        {modal?.type === "salesForm" && (
          <SalesForm
            tires={tiresApi.tires}
            batteries={batteriesApi.batteries}
            hardware={hardwareApi.hardware}
            onSave={salesApi.addSale}
            onClose={closeModal}
          />
        )}
        {modal?.type === "receiptForm" && (
          <ReceiptForm onSave={receiptsApi.addReceipt} onClose={closeModal} />
        )}
        {modal?.type === "installmentForm" && (
          <InstallmentForm
            onSave={installmentsApi.addInstallment}
            onClose={closeModal}
          />
        )}
        {modal?.type === "installmentDateForm" && (
          <InstallmentDateForm
            installment={installmentsApi.installments.find(
              (c) => c.id === modal.payload,
            )}
            onSave={(date) =>
              installmentsApi.setFirstInstallmentDate(modal.payload, date)
            }
            onClose={closeModal}
          />
        )}
      </Modal>
    </>
  );
}
