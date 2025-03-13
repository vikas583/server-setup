
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import Routes from "./routes";
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store/store';
import { Provider } from 'react-redux';
import { LoginInterceptor } from './interceptor/LoginInterceptor';
import SnackbarProvider from './common/snackbarProvider';
import { LoadingProvider } from './common/loader/loader-context';
import GlobalSpinner from './common/loader/loader-component';

function App() {

  return (
    <div className='App'>
      <LoadingProvider>
        <GlobalSpinner />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
              <SnackbarProvider>
                <LoginInterceptor />
                  <Routes />
              </SnackbarProvider>
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </LoadingProvider>
    </div>
  )
}

export default App
