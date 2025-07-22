import { Routes, Route } from 'react-router-dom';
import Login from '../../pages/login/Login';
import Home from '../../pages/home/Home';
import User from '../../pages/user/User';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import Customer from '../../pages/user/Customer';
import Project from '../../pages/project/Project';
import ProjectRequest from '../../pages/project/ProjectRequest';
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
        <Route path="home" element={<Home />} />
        <Route path="user" element={<User />} />
        <Route path="user-profile/:uId" element={<UserProfile/>}/>
        <Route path="customers" element={<Customer/>}/>
        <Route path="projects" element={<Project/>}/>
        <Route path="requests" element={<ProjectRequest/>}/>
        <Route path="project/:pid" element={<ProjectDetail/>}/>
        <Route path="email-config" element={<EmailConfig/>}/>
        {/* <Route path='system-setting' element= {<Setting/>}/> */}
        {/* Thêm các route con khác tại đây */}
        <Route index element={<Home />} />
      </Route>
      {/* Redirect không tìm thấy */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoute;