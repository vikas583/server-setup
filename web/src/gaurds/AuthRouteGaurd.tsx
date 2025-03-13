import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

const AuthRouteGaurd = () => {
    const isAuthenticated = useSelector((state: any) => state.auth.authenticated);

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthRouteGaurd
