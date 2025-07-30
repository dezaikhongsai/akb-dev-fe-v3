import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { selectAuthToken } from '../stores/auth/authSelector';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Utility function để debug cookie
const debugCookies = () => {
  const allCookies = document.cookie;
  const cookieArray = allCookies.split(';').map(cookie => cookie.trim());
  const cookieMap = new Map();
  
  cookieArray.forEach(cookie => {
    const [name, value] = cookie.split('=');
    if (name && value) {
      cookieMap.set(name, value);
    }
  });
  
  return {
    allCookies,
    cookieArray,
    cookieMap: Object.fromEntries(cookieMap),
    accessTokenFromMap: cookieMap.get('accessToken'),
    accessTokenFromCookies: Cookies.get('accessToken')
  };
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const cookieToken = Cookies.get('accessToken');
  const reduxToken = useSelector(selectAuthToken);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debug logging chi tiết hơn
  console.log('🔐 ProtectedRoute Debug:', {
    cookieToken: cookieToken ? 'EXISTS' : 'MISSING',
    cookieTokenValue: cookieToken ? `${cookieToken.substring(0, 20)}...` : 'null',
    reduxToken: reduxToken ? 'EXISTS' : 'MISSING',
    reduxTokenValue: reduxToken ? `${reduxToken.substring(0, 20)}...` : 'null',
    currentPath: window.location.pathname,
    isInitialized,
    cookieDebug: debugCookies(),
    timestamp: new Date().toISOString()
  });

  // Set initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Ưu tiên kiểm tra cookie trước
  if (!cookieToken) {
    console.log('❌ No cookie token, checking Redux token as fallback');
    
    // Fallback: Nếu có Redux token, vẫn cho phép access
    if (reduxToken) {
      console.log('⚠️ No cookie but Redux token exists, allowing access as fallback');
      return <>{children}</>;
    }
    
    console.log('❌ No cookie token and no Redux token, redirecting to login');
    console.log('🔍 Cookie details:', debugCookies());
    return <Navigate to="/login" replace />;
  }

  // Nếu có cookie token nhưng Redux store chưa được sync
  // (có thể xảy ra sau khi login thành công)
  if (!reduxToken && isInitialized) {
    console.log('⚠️ Cookie exists but no Redux token, allowing access');
    // Vẫn cho phép truy cập vì có cookie token
    // Redux sẽ được sync khi component mount
    return <>{children}</>;
  }

  // Nếu có cả cookie và Redux token, cho phép truy cập
  console.log('✅ Both cookie and Redux token exist, allowing access');
  return <>{children}</>;
};

export default ProtectedRoute;
