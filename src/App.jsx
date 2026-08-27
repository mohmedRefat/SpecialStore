import { useState } from "react";
import HardwareList from "./components/hardware/HardwareList.jsx";
import HardwareForm from "./components/hardware/HardwareForm.jsx";
import { useHardware } from "./hooks/useHardware.js";
import LoaderList from "./components/loaders/LoaderList.jsx";
import LoaderForm from "./components/loaders/LoaderForm.jsx";
import { useLoaders } from "./hooks/useLoaders.js";
import SalesList from "./components/sales/SalesList.jsx";
import SalesForm from "./components/sales/SalesForm.jsx";
import SalePaymentForm from "./components/sales/SalePaymentForm.jsx";
import { useSales } from "./hooks/useSales.js";
import ReceiptList from "./components/receipts/ReceiptList.jsx";
import ReceiptForm from "./components/receipts/ReceiptForm.jsx";
import { useReceipts } from "./hooks/useReceipts.js";
import AccountsPage from "./components/accounts/AccountsPage.jsx";
import AccountForm from "./components/accounts/AccountForm.jsx";
import AccountItemForm from "./components/accounts/AccountItemForm.jsx";
import { useAccounts } from "./hooks/useAccounts.js";
import ImportList from "./components/imports/ImportList.jsx";
import ImportForm from "./components/imports/ImportForm.jsx";
import { useImports } from "./hooks/useImports.js";
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
import HeavyInstallmentList from "./components/heavyInstallments/HeavyInstallmentList.jsx";
import HeavyInstallmentForm from "./components/heavyInstallments/HeavyInstallmentForm.jsx";
import HeavyInstallmentDateForm from "./components/heavyInstallments/HeavyInstallmentDateForm.jsx";
import PaymentAmountForm from "./components/installments/PaymentAmountForm.jsx";
import { useTires } from "./hooks/useTires.js";
import { useBatteries } from "./hooks/useBatteries.js";
import { useInstallments } from "./hooks/useInstallments.js";
import { useHeavyInstallments } from "./hooks/useHeavyInstallments.js";
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
  const heavyInstallmentsApi = useHeavyInstallments();
  const hardwareApi = useHardware();
  const loadersApi = useLoaders();
  const salesApi = useSales({ tiresApi, batteriesApi, hardwareApi, loadersApi, currentUserEmail: user?.email });
  const receiptsApi = useReceipts();
  const accountsApi = useAccounts();
  const importsApi = useImports();

  const isLoading =
    tiresApi.loading ||
    batteriesApi.loading ||
    installmentsApi.loading ||
    heavyInstallmentsApi.loading ||
    hardwareApi.loading ||
    loadersApi.loading;
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
      heavyInstallments: heavyInstallmentsApi.heavyInstallments,
      hardware: hardwareApi.hardware,
      loaders: loadersApi.loaders,
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
        if (imported.heavyInstallments) {
          heavyInstallmentsApi.setHeavyInstallments(imported.heavyInstallments);
        }
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
            {activeTab === "loaders" && (
              <LoaderList
                loaders={loadersApi.loaders}
                onAdjust={loadersApi.adjustQty}
                onDelete={loadersApi.deleteLoader}
                onOpenAdd={() => setModal({ type: "loaderForm" })}
              />
            )}
            {activeTab === "sales" && (
              <SalesList
                sales={salesApi.sales}
                onDelete={salesApi.deleteSale}
                onOpenAdd={() => setModal({ type: "salesForm" })}
                onOpenPaymentForm={(id) => setModal({ type: "salePaymentForm", payload: id })}
              />
            )}
            {activeTab === "receipts" && (
              <ReceiptList
                receipts={receiptsApi.receipts}
                onDelete={receiptsApi.deleteReceipt}
                onOpenAdd={() => setModal({ type: "receiptForm" })}
              />
            )}
            {activeTab === "accounts" && (
              <AccountsPage
                accounts={accountsApi.accounts}
                itemsFor={accountsApi.itemsFor}
                receipts={receiptsApi.receipts}
                onOpenAddAccount={() => setModal({ type: "accountForm" })}
                onOpenAddItem={(accountId) => setModal({ type: "accountItemForm", payload: accountId })}
                onOpenReceipt={(accountId, name) =>
                  setModal({ type: "receiptForm", payload: { accountId, name } })
                }
                onDeleteAccount={accountsApi.deleteAccount}
                onDeleteItem={accountsApi.deleteAccountItem}
              />
            )}
            {activeTab === "imports" && (
              <ImportList
                imports={importsApi.imports}
                onDelete={importsApi.deleteImport}
                onOpenAdd={() => setModal({ type: "importForm" })}
              />
            )}
            {activeTab === "installments" && (
              <InstallmentList
                items={installmentsApi.installments}
                onOpenPaymentForm={(id) =>
                  setModal({ type: "paymentForm", payload: { id, kind: "installments" } })
                }
                onUndoPayment={installmentsApi.undoPayment}
                onOpenDateForm={(id) =>
                  setModal({ type: "installmentDateForm", payload: id })
                }
                onOpenAdd={() => setModal({ type: "installmentForm" })}
                onDelete={installmentsApi.deleteInstallment}
              />
            )}
            {activeTab === "heavyInstallments" && (
              <HeavyInstallmentList
                items={heavyInstallmentsApi.heavyInstallments}
                onOpenPaymentForm={(id) =>
                  setModal({ type: "paymentForm", payload: { id, kind: "heavy" } })
                }
                onUndoPayment={heavyInstallmentsApi.undoPayment}
                onOpenDateForm={(id) =>
                  setModal({ type: "heavyInstallmentDateForm", payload: id })
                }
                onOpenAdd={() => setModal({ type: "heavyInstallmentForm" })}
                onDelete={heavyInstallmentsApi.deleteHeavyInstallment}
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
        {modal?.type === "loaderForm" && (
          <LoaderForm onSave={loadersApi.addLoader} onClose={closeModal} />
        )}
        {modal?.type === "salesForm" && (
          <SalesForm
            tires={tiresApi.tires}
            batteries={batteriesApi.batteries}
            hardware={hardwareApi.hardware}
            loaders={loadersApi.loaders}
            onSave={salesApi.addSale}
            onClose={closeModal}
          />
        )}
        {modal?.type === "salePaymentForm" && (
          <SalePaymentForm
            sale={salesApi.sales.find((s) => s.id === modal.payload)}
            onSave={(amount) => {
              const sale = salesApi.sales.find((s) => s.id === modal.payload);
              if (!sale) return;
              const paidSoFar =
                sale.paidAmount === null || sale.paidAmount === undefined
                  ? sale.total
                  : Number(sale.paidAmount);
              const newPaid = Math.min(Number(sale.total), paidSoFar + amount);
              salesApi.updateSale(modal.payload, { paidAmount: newPaid });
            }}
            onClose={closeModal}
          />
        )}
        {modal?.type === "receiptForm" && (
          <ReceiptForm
            accounts={accountsApi.accounts}
            defaultAccountId={modal.payload?.accountId || ""}
            defaultName={modal.payload?.name || ""}
            onSave={receiptsApi.addReceipt}
            onClose={closeModal}
          />
        )}
        {modal?.type === "accountForm" && (
          <AccountForm onSave={accountsApi.addAccount} onClose={closeModal} />
        )}
        {modal?.type === "accountItemForm" && (
          <AccountItemForm
            onSave={(form) => accountsApi.addAccountItem(modal.payload, form)}
            onClose={closeModal}
          />
        )}
        {modal?.type === "importForm" && (
          <ImportForm onSave={importsApi.addImport} onClose={closeModal} />
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
        {modal?.type === "heavyInstallmentForm" && (
          <HeavyInstallmentForm
            onSave={heavyInstallmentsApi.addHeavyInstallment}
            onClose={closeModal}
          />
        )}
        {modal?.type === "heavyInstallmentDateForm" && (
          <HeavyInstallmentDateForm
            installment={heavyInstallmentsApi.heavyInstallments.find(
              (c) => c.id === modal.payload,
            )}
            onSave={(date) =>
              heavyInstallmentsApi.setFirstInstallmentDate(modal.payload, date)
            }
            onClose={closeModal}
          />
        )}
        {modal?.type === "paymentForm" && (
          <PaymentAmountForm
            customer={
              modal.payload.kind === "heavy"
                ? heavyInstallmentsApi.heavyInstallments.find((c) => c.id === modal.payload.id)
                : installmentsApi.installments.find((c) => c.id === modal.payload.id)
            }
            onSave={(amount) =>
              modal.payload.kind === "heavy"
                ? heavyInstallmentsApi.logPayment(modal.payload.id, amount)
                : installmentsApi.logPayment(modal.payload.id, amount)
            }
            onClose={closeModal}
          />
        )}
      </Modal>
    </>
  );
}