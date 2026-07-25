import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from '../components/layout/Toast.jsx';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setShow(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(false), 1800);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={message} show={show} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
