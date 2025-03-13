import { useNavigate } from "react-router-dom";
import axiosClient from '../utils/axiosClient';
import { useDispatch } from "react-redux";
import { destroyContext } from "../features/auth/authSlice";

const api = axiosClient

const LoginInterceptor = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    // Request Interceptor
    api.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response && error.response.status === 401) {
                dispatch(destroyContext())
                // navigate('/');
            }
            return Promise.reject(error);
        }
    );

    return null;
};

export { api, LoginInterceptor };