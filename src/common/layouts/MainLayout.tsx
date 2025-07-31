import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; // Import useCallback
import { Layout, Menu, Avatar, Button, Dropdown, Breadcrumb, Modal, Tooltip } from 'antd';
import {
  MenuUnfoldOutlined,
  ProjectOutlined,
  FormOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  MailOutlined,
  SafetyOutlined,
  HomeOutlined,
  IdcardOutlined,
  KeyOutlined,
  EditOutlined,
  TeamOutlined,
  UserOutlined,
  CloseOutlined,
  PlusOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import { logout } from '../../services/auth';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutRedux, updateToken } from '../../common/stores/auth/authSlice';
import { selectAuthUser, selectAuthToken } from '../../common/stores/auth/authSelector';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AppFooter from './components/AppFooter';
import { useDebounce } from '../../common/hooks/useDebounce';
import { autoSearchProject } from '../../services/home/home.service';
import SearchBox from '../components/SearchBox';
// import Notification from '../components/Notification';
import type { ItemType } from 'antd/es/menu/interface'; // Correct import for Ant Design types
import ModalQuickAddDoc from '../../pages/project/components/documents/components/ModalQuickAddDoc';
import ModalAddProject from '../../pages/project/components/projects/ModalAddProject';
import { createProject } from '../../services/project/project.service';
// import ModalQuickAddDoc from '../../pages/project/components/documents/components/ModalQuickAddDoc';

const { Header, Sider, Content } = Layout;

interface MenuItemConfig {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface MenuConfig {
  [key: string]: MenuItemConfig;
}

// Trong MainLayout.tsx, thay thế interface Project hiện tại bằng:
interface Project {
  _id: string;
  name: string;
  alias: string;
  pm?: {
    _id: string;
    profile: {
      name: string;
      emailContact?: string;
    };
  };
  customer?: {
    _id: string;
    profile: {
      name: string;
      emailContact?: string;
    };
  };
}

const MainLayout: React.FC = () => {
  const { t } = useTranslation(['mainLayout', 'common']);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectAuthUser);
  const dispatch = useDispatch();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['home']);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchValue = useDebounce(searchValue, 400);
  const [openModalAddDocument, setOpenModalAddDocument] = useState(false);
  const [openModalAddProject, setOpenModalAddProject] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const reduxToken = useSelector(selectAuthToken);

  // Sync Redux store with cookies when component mounts
  useEffect(() => {
    const cookieToken = Cookies.get('accessToken');
    
    console.log('🔄 MainLayout Token Sync:', {
      cookieToken: cookieToken ? 'EXISTS' : 'MISSING',
      reduxToken: reduxToken ? 'EXISTS' : 'MISSING',
      currentPath: location.pathname,
      timestamp: new Date().toISOString()
    });
    
    // If we have cookie token but no Redux token, sync them
    if (cookieToken && !reduxToken) {
      console.log('🔄 Syncing Redux token with cookie token');
      dispatch(updateToken({ accessToken: cookieToken }));
    }
  }, [dispatch, reduxToken]);

  // Handle click outside to close search results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchValue) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const response = await autoSearchProject(debouncedSearchValue);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchValue]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleResultClick = useCallback((project: Project) => {
    navigate(`/projects/${project._id}`);
    setSearchValue('');
    setSearchResults([]);
  }, [navigate]);

  // Menu configuration for consistent navigation and breadcrumb
  const menuConfig: MenuConfig = useMemo(() => ({
    home: {
      key: 'home',
      icon: <HomeOutlined />,
      label: t('menu.home'),
    },
    'project-management': {
      key: 'project-management',
      icon: <ProjectOutlined />,
      label: t('menu.project_management'),
    },
    'project': {
      key: 'project',
      icon: <ProjectOutlined />,
      label: t('menu.project_detail'),
    },
    'projects': {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: t('menu.projects'),
    },
    'project-detail': {
      key: 'project-detail',
      icon: <ProjectOutlined />,
      label: 'Chi tiết dự án'
    },
    'request-management': {
      key: 'request-management',
      icon: <FormOutlined />,
      label: t('menu.request_management'),
    },
    'requests': {
      key: 'requests',
      icon: <FormOutlined />,
      label: t('menu.requests'),
    },
    'user-management': {
      key: 'user-management',
      icon: <TeamOutlined />,
      label: t('menu.user_management'),
    },
    'user': {
      key: 'user',
      icon: <IdcardOutlined />,
      label: t('menu.user'),
    },
    'customers': {
      key: 'customers',
      icon: <UserOutlined />,
      label: t('menu.customers'),
    },
    'system': {
      key: 'system',
      icon: <SafetyOutlined />,
      label: t('menu.system'),
    },
    'email-config': {
      key: 'email-config',
      icon: <MailOutlined />,
      label: t('menu.email_config'),
    },
  }), [t]);

  // Convert menuConfig to Ant Design Menu items format with grouping
  const menuItems: ItemType[] = useMemo(() => {
    return [
  
      // Project Management Group
      {
        key: 'project-management',
        icon: menuConfig['project-management'].icon,
        label: menuConfig['project-management'].label,
        children: [
          {
            key: 'projects',
            icon: menuConfig['projects'].icon,
            label: menuConfig['projects'].label,
          },
        ],
      },
      // Request Management Group
      // User Management Group
      {
        key: 'user-management',
        icon: menuConfig['user-management'].icon,
        label: menuConfig['user-management'].label,
        children: [
          {
            key: 'user',
            icon: menuConfig.user.icon,
            label: menuConfig.user.label,
          },
        ],
      },
      // System Group
      {
        key: 'system',
        icon: menuConfig.system.icon,
        label: menuConfig.system.label,
        children: [
          {
            key: 'email-config',
            icon: menuConfig['email-config'].icon,
            label: menuConfig['email-config'].label,
          },
        ],
      },
    ];
  }, [menuConfig, t]);

  // Update breadcrumb based on selected menu
  const getBreadcrumbItems = useCallback(() => {
    let pathSnippets = location.pathname.split('/').filter(Boolean);

    // Nếu có 'user-profile' trong path, cắt bỏ các segment sau nó
    const userProfileIndex = pathSnippets.indexOf('user-profile');
    if (userProfileIndex !== -1) {
      pathSnippets = pathSnippets.slice(0, userProfileIndex + 1);
    }

    const breadcrumbMap: Record<string, string> = {
      home: 'Trang chủ',
      projects: 'Danh sách dự án',
      project: 'Danh sách dự án',
      settings: 'Cài đặt',
      user: 'Danh sách người dùng',
      requests: 'Yêu cầu',
      customers: 'Danh sách khách hàng',
      'email-config': 'Cấu hình email',
      'user-profile': 'Thông tin cá nhân',
    };

    const customNavigateMap: Record<string, string> = {
      project: '/projects',
    };

    const items = [
      {
        title: (
          <span>
            {'AKB Quản lý yêu cầu'}
          </span>
        )
      },
      ...pathSnippets.map((segment, index) => {
        const url = customNavigateMap[segment] || '/' + pathSnippets.slice(0, index + 1).join('/');
        const label = breadcrumbMap[segment] || 'Chi tiết dự án';

        return {
          title: (
            <span onClick={() => navigate(url)} style={{ cursor: 'pointer' }}>
              {label}
            </span>
          )
        };
      })
    ];

    return items;
  }, [location.pathname, navigate]);




  // Handle menu click
  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    // Only update if the key is different to prevent unnecessary re-renders
    if (selectedKeys[0] !== key) {
      setSelectedKeys([key]);
    }
    navigate(`/${key}`);
  }, [selectedKeys, navigate]);

  // Handle submenu open/close
  const handleOpenChange = useCallback((keys: string[]) => {
    // Only update if keys are different
    if (JSON.stringify(openKeys) !== JSON.stringify(keys)) { // Deep compare arrays
      setOpenKeys(keys);
    }
  }, [openKeys]);

  // Update selected keys based on current route
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    const newSelectedKey = path || 'home';

    // Only update state if values have actually changed
    if (selectedKeys[0] !== newSelectedKey) {
      setSelectedKeys([newSelectedKey]);
    }
  }, [location.pathname, selectedKeys]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      if (!prev) {
        // When collapsing, store current openKeys and clear them
        setOpenKeys([]);
      }
      return !prev;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      dispatch(logoutRedux());
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      navigate('/login', { replace: true });
      message.success(t('common:messages.success.logout'));
    } catch (error: unknown) {
      console.error('Logout error:', error);
      dispatch(logoutRedux());
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });
      navigate('/login', { replace: true });
      message.warning(t('common:messages.warning.logout_partial'));
    }
  }, [dispatch, navigate, t]);

  const handleUserProfile = useCallback((uId: string) => {
    navigate(`/user-profile/${uId}`);
  }, [navigate]);

  const displayName = useMemo(() => {
    if (user?.profile?.name) {
      return user.profile.name;
    }
    if (user?.alias) {
      return user.alias;
    }
    return user?.email || '---';
  }, [user]);

  const getAvatarText = useMemo(() => {
    if (user?.profile?.name) {
      const words = user.profile.name.trim().split(' ');
      const lastWord = words[words.length - 1];
      return lastWord?.[0]?.toUpperCase() || '?';
    }
    if (user?.email) {
      return user.email[0]?.toUpperCase() || '?';
    }
    return '?';
  }, [user]);

  const getAvatarColor = useMemo(() => {
    const colors = [
      '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',

    ];
    const str = user?.email || user?.profile?.name || '';
    const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [user]);

  const handleModalAddProjectSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);
      const response = await createProject(values);
      console.log('Project created:', response);
      setOpenModalAddProject(false);
      message.success(t('common:messages.success.project_created'));
      
      // Refresh content based on current location
      if (location.pathname.includes('/projects')) {
        // If on projects list page, refresh content to show new project
        setRefreshKey(prev => prev + 1);
      } else if (location.pathname.includes('/project/')) {
        // If on project detail page, redirect to projects list to see new project
        navigate('/projects');
      }
      // For other pages, just close the modal without refresh
    } catch (error) {
      console.error('Error creating project:', error);
      message.error(t('common:messages.error.project_creation_failed'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleModalAddDocumentSuccess = (_type: string) => {
    setOpenModalAddDocument(false);
    message.success(t('common:messages.success.addDocument'));
    
    // Refresh content based on current location
    if (location.pathname.includes('/project/')) {
      // If on project detail page, refresh content to show new document
      setRefreshKey(prev => prev + 1);
    } else if (location.pathname.includes('/projects')) {
      // If on projects list page, refresh content to update any document counts
      setRefreshKey(prev => prev + 1);
    }
    // For other pages, just close the modal without refresh
  };

  // Handle click outside to close FAB
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const fabContainer = document.getElementById('fab-container');
      if (fabContainer && !fabContainer.contains(event.target as Node)) {
        setFabExpanded(false);
      }
    };

    if (fabExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fabExpanded]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Thanh Header */}
      <Header
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 100,
          width: '100%',
          background: '#FFFFFF',
          padding: '0 0 0 24px',
          height: '60px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 1px 1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: 16
        }}>
          {/* Header bên trái */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: toggleCollapsed,
              style: { fontSize: 20, cursor: 'pointer', color: '#0F0F0F', paddingLeft: '5px' },

            })}
            <img
              src="/akb-icon.ico"
              alt="avatar"
              style={{ width: 35, height: 35, borderRadius: 6, objectFit: 'cover' }}
            />
            <div style={{ padding: '16px 0' }}>
              <Breadcrumb items={getBreadcrumbItems()} style={{ fontSize: 14 }} />
            </div>
          </div>

          {/* Header bên phải */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div ref={searchRef} style={{ position: 'relative', paddingRight: 5 }}>
              <SearchBox
                options={searchResults}
                placeholder={t('search_placeholder')}
                style={{ width: 200 }}
                value={searchValue}
                onChange={(value) => {
                  handleSearch(value);
                }}
                onSelectProject={(project) => {
                  handleResultClick(project);
                }}
                loading={loading}
                noDataMessage={t('no_results')}
              />
            </div>
            {/* Ô thông báo */}
            {/* <Notification /> */}
            {/* ô ngôn ngữ */}
            <LanguageSwitcher />
            {/* ô profile */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'alias',
                    icon: <KeyOutlined style={{ color: '#1890ff' }} />,
                    label: (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{t('user_dropdown.employee_code')}</span>
                        <span style={{ color: '#666' }}>{user?.alias || '---'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'email',
                    icon: <MailOutlined style={{ color: '#52c41a' }} />,
                    label: (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{t('user_dropdown.contact_email')}</span>
                        <span style={{ color: '#666' }}>{user?.profile?.emailContact || user?.email || '---'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'role',
                    icon: <SafetyOutlined style={{ color: '#faad14' }} />,
                    label: (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{t('user_dropdown.role')}</span>
                        <span style={{ color: '#666' }}>{user?.role || '---'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'action',
                    icon: <EditOutlined style={{ color: '#722ed1' }} />,
                    label: (
                      <Button
                        onClick={() => { handleUserProfile(user?._id ?? '') }}
                        type="link"
                        disabled={!user?._id}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {t('user_dropdown.edit_profile')}
                      </Button>
                    ),
                  },
                  {
                    key: 'divider',
                    type: 'divider',
                  },
                  {
                    key: 'logout',
                    label: (
                      <Button
                        style={{ width: '100%' }}
                        icon={<LogoutOutlined />}
                        type="primary"
                        danger
                        onClick={() => {
                          Modal.confirm({
                            title: t('confirm_logout_title'),
                            content: t('confirm_logout_content'),
                            okText: <><LogoutOutlined /> {t('ok_text')}</>,
                            cancelText: <><CloseOutlined /> {t('cancel_text')}</>,
                            okType: 'danger',
                            centered: false,
                            onOk: handleLogout,
                          });
                        }}
                      >
                        {t('logout')}
                      </Button>

                    ),
                  },
                ],
              }}
              overlayStyle={{ width: 'fit-content', paddingRight: 26 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  padding: '0px 25px 0px 20px',
                  height: '60px',
                  backgroundColor: 'transparent',

                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}

              >
                <Avatar
                  style={{
                    backgroundColor: getAvatarColor,
                    verticalAlign: 'middle'
                  }}
                >
                  {getAvatarText}
                </Avatar>
                <span style={{ fontWeight: 500, color: '#444746' }}>{displayName}</span>
                {/* <SettingOutlined style={{ color: '#444746' }} /> */}
              </div>
            </Dropdown>
            {/* Dropdown profile */}
          </div>
        </div>
      </Header>
      <Layout style={{
        marginTop: '62px',
        background: '#f5f5f5', // Light gray background
        display: 'flex',
        flexDirection: 'row'
      }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px #f0f1f2',
            position: 'fixed',
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
          width={260}
        >
          <Menu
            mode="inline"
            theme="light"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            style={{
              borderRight: 0,
              flex: 1
            }}
            onClick={handleMenuClick}
            items={menuItems}
          />

          <div style={{
            background: '#fff'
          }}>
          </div>
        </Sider>
        <Layout style={{
          marginLeft: collapsed ? '80px' : '260px',
          transition: 'margin-left 0.2s',
          background: '#f5f5f5', // Light gray background
          padding: '10px 14px'
        }}>
          <Content style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 240px)', // Adjusted for breadcrumb and tabs
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          }}>
            <Outlet key={refreshKey} />
          </Content>
          <AppFooter />
        </Layout>
      </Layout>
      
      {/* Floating Action Button with Sub-buttons */}
      <div 
        id="fab-container"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 16
        }}
      >
        {/* Sub-buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          opacity: fabExpanded ? 1 : 0,
          transform: fabExpanded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: fabExpanded ? 'auto' : 'none'
        }}>
          <Tooltip title={t('quick_add_document')}>
          <Button
            type="primary"
            shape="circle"
            size="middle"
            icon={<FileAddOutlined />}
            style={{
              width:  45,
              height: 45,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              transform: fabExpanded ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = fabExpanded ? 'scale(1.1)' : 'scale(0.8)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = fabExpanded ? 'scale(1)' : 'scale(0.8)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onClick={() => {
              setOpenModalAddDocument(true);
              setFabExpanded(false);
            }}
            title={t('quick_add_document')}
          />
          </Tooltip>
         <Tooltip title={t('quick_add_project')}>
         <Button
            type="primary"
            shape="circle"
            size="small"
            icon={<ProjectOutlined />}
            style={{
              width: 45,
              height: 45,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              backgroundColor: '#1890ff',
              borderColor: '#1890ff',
              transform: fabExpanded ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = fabExpanded ? 'scale(1.1)' : 'scale(0.8)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = fabExpanded ? 'scale(1)' : 'scale(0.8)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onClick={() => {
              setOpenModalAddProject(true);
              setFabExpanded(false);
            }}
            title={t('quick_add_project')}
          />
         </Tooltip>
        </div>
        
        {/* Main FAB */}
        <Button
          type="primary"
          shape="circle"
          size="small"
          icon={fabExpanded ? <CloseOutlined /> : <PlusOutlined />}
          style={{
            width: 45,
            height: 45,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            backgroundColor: fabExpanded ? '#ff4d4f' : '#722ed1',
            borderColor: fabExpanded ? '#ff4d4f' : '#722ed1',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: fabExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = fabExpanded ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = fabExpanded ? 'rotate(45deg) scale(1)' : 'rotate(0deg) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onClick={() => setFabExpanded(!fabExpanded)}
        />
      </div>

      {/* Modals */}
      <ModalQuickAddDoc
        open={openModalAddDocument}
        onClose={() => setOpenModalAddDocument(false)}
        mode='out'
        onSuccess={handleModalAddDocumentSuccess}
      />
      {/* <ModalQuickAddDoc 
         open={openModalAddDocument}
         onClose={() => setOpenModalAddDocument(false)}
         mode='out'
         onSuccess={handleModalAddDocumentSuccess}
      /> */}
      <ModalAddProject
        open={openModalAddProject}
        onCancel={() => setOpenModalAddProject(false)}
        onSubmit={handleModalAddProjectSubmit}
        loading={submitLoading}
      />
    </Layout>
  );
};

export default MainLayout;