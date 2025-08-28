/* eslint-disable @next/next/no-html-link-for-pages */
// layouts/MainLayout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form } from 'antd';
import { 
  Plus, 
  Settings, 
  Users, 
  CreditCard,
  Star,
  Clock,
  Home,
  Moon,
  Sun,
  Search,
  User,
  LogOut,
  Grid3X3,
  BookOpen} from 'lucide-react';
import { useSharedTheme } from '@/contexts/ThemeContext';
import { useProjects } from '@/contexts/ProjectContext';
import CreateProjectDrawer, { ProjectFormData } from '@/components/CreateProjectDrawer';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useSharedTheme();
  const { addProject } = useProjects();
  
  const shouldShowSidebar = showSidebar !== undefined ? showSidebar : !pathname.startsWith('/boards');
  const [, setIsSearchFocused] = useState(false);
  const [, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add Form instance for the drawer
  const [form] = Form.useForm();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setShowNotifications(false);
        setShowUserMenu(false);
        setIsMobileMenuOpen(false); // This will close the mobile menu
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerOpen(false);
    form.resetFields();
  };

  // Handle project creation
  const handleCreateProject = async (values: ProjectFormData) => {
    try {
      console.log('Creating project with values:', values);
      
      // Add the project using context
      const newProject = addProject({
        name: values.name,
        description: values.description,
        workspace: 'Kanban Workspace'
      });
      
      // Close the drawer after successful creation
      setIsDrawerOpen(false);
      form.resetFields();
      
      // Optionally navigate to the new project
      router.push(`/boards/${newProject.id}`);
      
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const headerMenuItems = [
    { key: 'workspaces', label: 'Workspaces', icon: Grid3X3 },
    { key: 'recent', label: 'Recent', icon: Clock },
    { key: 'starred', label: 'Starred', icon: Star },
    { key: 'templates', label: 'Templates', icon: BookOpen }
  ];

  const userMenuItems = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'logout', label: 'Logout', icon: LogOut, danger: true }
  ];

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 h-16 border-b z-40 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 ${
        isDarkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
      }`}>
        
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center space-x-4 lg:space-x-8">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <span className={`text-xl font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Kanban
            </span>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            {headerMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.key}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search boards, cards..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              }`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Create Button */}
          <Button 
            onClick={showDrawer}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4"
          >
            <Plus className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Create</span>
          </Button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Avatar/Menu Trigger */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
            data-dropdown
          >
            <User className="h-4 w-4" />
          </button>

          {/* User Menu Dropdown */}
          <div className="relative" data-dropdown>
            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                {userMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.key}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors ${
                        item.danger
                          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-50'
                      } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Add top padding to prevent content being hidden under fixed header */}
      <div className="pt-16">
        <div className="flex">
          {/* Conditional Left Sidebar */}
          {shouldShowSidebar && (
            <aside className={`w-64 min-h-[calc(100vh-4rem)] border-r ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4">
                <nav className="space-y-2">
                  <a 
                    href="/" 
                    className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                      pathname === '/' 
                        ? isDarkMode 
                          ? 'bg-blue-900/50 text-blue-300' 
                          : 'bg-blue-50 text-blue-700'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </a>
                  <a 
                    href="#" 
                    className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span>Boards</span>
                  </a>
                  <a 
                    href="#" 
                    className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span>Templates</span>
                  </a>
                </nav>

                <div className="mt-8">
                  <h3 className={`text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    Workspaces
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">
                        T
                      </div>
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Kanban Workspace
                      </span>
                    </div>
                    
                    <nav className="ml-8 space-y-1">
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors py-1 ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span>Boards</span>
                      </a>
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors py-1 ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Users className="h-4 w-4" />
                        <span>Members</span>
                      </a>
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors py-1 ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </a>
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors py-1 ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-gray-300'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Billing</span>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content - Full Width */}
          <main className={`flex-1 min-h-[calc(100vh-4rem)] ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {/* Render children directly without additional sidebar */}
            {children}
          </main>
        </div>
      </div>

      {/* Create Project Drawer */}
      <CreateProjectDrawer
        isOpen={isDrawerOpen}
        onClose={onCloseDrawer}
        onCreateProject={handleCreateProject}
        form={form}
      />
    </div>
  );
};

export default MainLayout;