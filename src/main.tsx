import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster as HotToaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import App from './App.jsx';
import { AuthInitializer } from './providers/auth-initializer';
import { QueryProvider } from './providers/query-provider';
import { store } from './reducer/store';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <QueryProvider>
        <BrowserRouter>
          <AuthInitializer>
            <App />
          </AuthInitializer>
          {/* sonner for migrated code, react-hot-toast for the legacy thunks. */}
          <Toaster position="top-center" richColors />
          <HotToaster />
        </BrowserRouter>
      </QueryProvider>
    </Provider>
  </StrictMode>
);
