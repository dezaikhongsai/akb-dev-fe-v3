import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { selectAuthToken } from '../stores/auth/authSelector';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const cookieToken = Cookies.get('accessToken');
  const reduxToken = useSelector(selectAuthToken);

  // Kiểm tra cả cookie và redux store
  if (!cookieToken || !reduxToken) {
    // Nếu không có token, chuyển hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, cho phép truy cập route
  return <>{children}</>;
};

export default ProtectedRoute;
