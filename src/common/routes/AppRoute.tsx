import { Routes, Route } from 'react-router-dom';
import Login from '../../pages/login/Login';
import User from '../../pages/user/User';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Project from '../../pages/project/Project';
import EmailConfig from '../../pages/mail/EmailConfig';
import UserProfile from '../../pages/user/UserProfile';
import ProjectDetail from '../../pages/project/ProjectDetail';
import NotFound from '../components/NotFound';

const AppRoute = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={
        <Login />
        } />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout  />
          </ProtectedRoute>
        }
      >
        <Route path="user" element={<User />} />
        <Route path="user-profile/:uId" element={<UserProfile/>}/>
        <Route path="projects" element={<Project/>}/>
        <Route path="projects/:pid" element={<ProjectDetail/>}/>
        <Route path="email-config" element={<EmailConfig/>}/>
        {/* <Route path='system-setting' element= {<Setting/>}/> */}
        {/* Thêm các route con khác tại đây */}
      </Route>
      {/* Redirect không tìm thấy */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoute;