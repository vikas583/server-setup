import { Outlet, Navigate } from "react-router-dom";


const TempTokenProtectedRoute = () => {
    let tempToken = localStorage.getItem('tempToken');

    return tempToken ? <Outlet /> : <Navigate to="/login" />;
};

export default TempTokenProtectedRoute;