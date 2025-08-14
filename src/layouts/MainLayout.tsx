"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  Bell,
  User,
  LogOut,
  ChevronDown,
  Grid3X3,
  BookOpen,
  X,
  Menu
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar }) => {
  const pathname = usePathname();
  
  const shouldShowSidebar = showSidebar !== undefined ? showSidebar : !pathname.startsWith('/boards');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setShowNotifications(false);
        setShowUserMenu(false);
        setIsMobileMenuOpen(false);
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
  };

  const headerMenuItems = [
    { key: 'workspaces', label: 'Workspaces', icon: Grid3X3 },
    { key: 'recent', label: 'Recent', icon: Clock },
    { key: 'starred', label: 'Starred', icon: Star },
    { key: 'templates', label: 'Templates', icon: BookOpen }
  ];

  const notifications = [
    { id: 1, message: 'John assigned you to "Design System"', time: '2 min ago' },
    { id: 2, message: 'New comment on "Marketing Campaign"', time: '5 min ago' },
    { id: 3, message: 'Board "Development Sprint" updated', time: '1 hour ago' }
  ];

  const userMenuItems = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'logout', label: 'Logout', icon: LogOut, danger: true }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-black' : 'bg-gray-50'}`}>
      {/* Fixed Header with proper z-index and positioning */}
      <header className={`fixed top-0 left-0 right-0 h-16 border-b z-40 ${
        isDarkMode ? 'bg-gray-900/95 border-gray-700 backdrop-blur-sm' : 'bg-white/95 border-gray-200 backdrop-blur-sm'
      } flex items-center justify-between px-4 lg:px-6`}>
        
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center space-x-4 lg:space-x-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            data-dropdown
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center Section - Search (responsive) */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search boards, cards..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
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

          {/* Notifications */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg shadow-lg border z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notifications
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`px-4 py-3 border-b last:border-b-0 ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                    } cursor-pointer`}>
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Menu */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
              <span className={`text-sm font-medium hidden sm:block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                John Doe
              </span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
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
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className={`absolute top-16 left-0 right-0 border-b md:hidden z-30 ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <nav className="px-4 py-3 space-y-1">
              {headerMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Add top padding to prevent content being hidden under fixed header */}
      <div className="pt-16">
        <div className="flex">
          {/* Conditional Sidebar */}
          {shouldShowSidebar && (
            <aside className={`w-64 min-h-[calc(100vh-4rem)] border-r ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4">
                <nav className="space-y-2">
                  <a 
                    href="#" 
                    className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                      isDarkMode 
                        ? 'text-white hover:bg-gray-800' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </a>
                  <a 
                    href="#" 
                    className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                      isDarkMode 
                        ? 'text-white hover:bg-gray-800' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>Boards</span>
                  </a>
                  <a 
                    href="#" 
                    className={`flex items-center space-x-3 rounded-lg p-2 transition-colors ${
                      isDarkMode 
                        ? 'text-white hover:bg-gray-800' 
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>Templates</span>
                  </a>
                </nav>

                <div className="mt-8">
                  <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Workspaces
                  </h3>
                  <div className="space-y-2">
                    <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">
                        T
                      </div>
                      <span className="text-sm">Kanban Workspace</span>
                    </div>
                    
                    <nav className="ml-8 space-y-1">
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span>Boards</span>
                      </a>
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Users className="h-4 w-4" />
                        <span>Members</span>
                      </a>
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </a>
                      <a 
                        href="#" 
                        className={`flex items-center space-x-2 text-sm transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white' 
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

          {/* Main Content */}
          <main className={`flex-1 min-h-[calc(100vh-4rem)] ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Create Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create New Board
              </h2>
              <button
                onClick={onCloseDrawer}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Board Name
                </label>
                <input 
                  placeholder="Enter board name"
                  className={`w-full p-3 rounded-md border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea 
                  placeholder="Enter board description"
                  className={`w-full p-3 rounded-md border resize-none ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={onCloseDrawer}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Board
                </Button>
                <Button 
                  variant="outline"
                  onClick={onCloseDrawer}
                  className={`flex-1 ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;