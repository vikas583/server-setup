import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authService from '../services/authService';
import { destroyContext } from '../features/auth/authSlice';
import { persistor } from '../store/store';
import { showGlobalSnackbar } from './snackbarProvider';

export const useLogout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const globalLogout = useCallback(async () => {
        const response = await authService.logout()
        if (response.status) {
            dispatch(destroyContext())
            localStorage.clear()
            persistor.purge()
            navigate('/')
        } else {
            showGlobalSnackbar('Something went wrong, try again later!', 'error')
        }
    }, [navigate, dispatch]);


    return { globalLogout };
};