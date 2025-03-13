import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UserRoles } from '../types';

const RoleBasedGuard: React.FC<{ allowedRoles: UserRoles[] }> = ({ allowedRoles }) => {
    // Get auth state from Redux store
    const { authenticated, userData } = useSelector((state: any) => state.auth);

    // Check authentication first
    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(userData.role)) {
        // You might want to navigate to a forbidden page or dashboard
        return <Navigate to="/un-authorized" replace />;
    }

    return <Outlet />;
};

export default RoleBasedGuard;