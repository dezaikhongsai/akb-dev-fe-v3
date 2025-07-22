import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; // Import useCallback
import { Layout, Menu, Avatar, Button, Dropdown, Modal, Breadcrumb } from 'antd';
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
  GlobalOutlined,
  KeyOutlined,
  EditOutlined,
  CloseOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { logout } from '../../services/auth';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutRedux } from '../../common/stores/auth/authSlice';
import { selectAuthUser } from '../../common/stores/auth/authSelector';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AppFooter from './components/AppFooter';
import { useDebounce } from '../../common/hooks/useDebounce';
import { autoSearchProject } from '../../services/home/home.service';
import SearchBox from '../components/SearchBox';
import Notification from '../components/Notification';
import type { ItemType } from 'antd/es/menu/interface'; // Correct import for Ant Design types

const { Header, Sider, Content } = Layout;

interface MenuItemConfig {
  key: string;
  icon: React.ReactNode;
  label: string;
}

interface MenuConfig {
  [key: string]: MenuItemConfig;
}

interface Project {
  _id: string;
  name: string;
  alias: string;
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
    navigate(`/project/${project._id}`);
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
      // Home
      {
        key: 'home',
        icon: menuConfig.home.icon,
        label: menuConfig.home.label,
      },
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
      {
        key: 'request-management',
        icon: menuConfig['request-management'].icon,
        label: menuConfig['request-management'].label,
        children: [
          {
            key: 'requests',
            icon: menuConfig['requests'].icon,
            label: menuConfig['requests'].label,
          },
        ],
      },
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
          {
            key: 'customers',
            icon: menuConfig.customers.icon,
            label: menuConfig.customers.label,
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
    const items = [
      {
        title: (
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <HomeOutlined /> {menuConfig.home.label}
          </span>
        ),
      },
    ];

    const currentPath = location.pathname;
    const currentKey = selectedKeys[0];

    // Special case for user profile
    if (currentPath.includes('user-profile')) {
      items.push({
        title: (
          <span>
            <IdcardOutlined /> {t('breadcrumb.profile')}
          </span>
        ),
      });
      return items;
    }
    // Only add current page if it's not home
    if (currentKey !== 'home') {
      // Direct lookup in menuConfig
      const currentItem = menuConfig[currentKey];
      if (currentItem) {
        items.push({
          title: (
            <span>
              {currentItem.icon} {currentItem.label}
            </span>
          ),
        });
      }
    }
    return items;
  }, [selectedKeys, menuConfig, navigate, location.pathname, t]);

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
      '#f56a00', '#7265e6', '#ffbf00', '#00a2ae'
    ];
    const str = user?.email || user?.profile?.name || '';
    const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [user]);



  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Thanh Header */}
      <Header
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 100,
          width: '100%',
          background: '#222D32',
          padding: '0 24px',
          height: '64px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
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
              style: { fontSize: 20, cursor: 'pointer', color: '#fff' },
            })}
            <img
              src="/akb-icon.ico"
              alt="avatar"
              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
            />
          </div>
          {/* Header bên phải */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div ref={searchRef} style={{ position: 'relative' }}>
              <SearchBox
                options={searchResults.map(project => ({
                  name: project.name,
                  alias: project.alias
                }))}
                placeholder={t('search_placeholder')}
                style={{ width: 200 }}
                value={searchValue}
                onChange={(value) => {
                  handleSearch(value);
                  const selectedProject = searchResults.find(p => p.alias === value);
                  if (selectedProject) {
                    handleResultClick(selectedProject);
                  }
                }}
                loading={loading}
                noDataMessage={t('no_results')}
              />
            </div>
            <Notification />
            <LanguageSwitcher />
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
                    key: 'language',
                    icon: <GlobalOutlined style={{ color: '#13c2c2' }} />,
                    label: (
                      <div style={{ padding: '4px 0' }}>

                      </div>
                    ),
                  },
                ],
              }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                style={{
                  cursor: 'pointer',
                  backgroundColor: getAvatarColor,
                  verticalAlign: 'middle'
                }}
              >
                {getAvatarText}
              </Avatar>
            </Dropdown>
            <span style={{ fontWeight: 500, color: '#fff' }}>{displayName}</span>
            <Button
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

          </div>
        </div>
      </Header>
      <Layout style={{
        marginTop: '64px',
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
          padding: '0 24px'
        }}>
          <div style={{ padding: '16px 0' }}>
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <Content style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 240px)', // Adjusted for breadcrumb and tabs
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          }}>
            <Outlet />
          </Content>
          <AppFooter />
        </Layout>
      </Layout>
    </Layout >
  );
};

export default MainLayout;