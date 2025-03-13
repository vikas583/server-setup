import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import authSlice from '../features/auth/authSlice';

// Persist configuration for authSlice
const persistConfig = {
    key: 'auth',
    storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice);


const store = configureStore({
    reducer: {
        auth: persistedAuthReducer, // Use the persisted reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disable serializable check
        }),
});

// Create a persistor
export const persistor = persistStore(store);

export default store;
