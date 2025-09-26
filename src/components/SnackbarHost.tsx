import React, { createContext, useCallback, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

interface SnackbarContextValue {
  show(message: string): void;
}
const SnackbarContext = createContext<SnackbarContextValue | undefined>(undefined);

export const useAppSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useAppSnackbar must be used within SnackbarProvider');
  return ctx;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const show = useCallback((msg: string) => { setMessage(msg); setVisible(true); }, []);
  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={4000} accessibilityLiveRegion="polite">
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
