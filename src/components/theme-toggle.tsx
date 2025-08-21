"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext'; // Import the theme context
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
  X
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showSidebar }) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme(); // Use the global theme context
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Auto-detect: Hide sidebar on board pages, show on all other pages
  const shouldShowSidebar = showSidebar !== undefined ? showSidebar : !pathname.startsWith('/boards');
  
  // Remove local isDarkMode state - use theme from context instead
  const isDarkMode = theme === 'dark';
  
  const [, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Remove the local toggleTheme function - use the one from context

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
      {/* Enhanced Header */}
      <header className={`h-16 border-b ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} flex items-center justify-between px-6`}>
        
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Kanban
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
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

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search boards, cards, and more..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
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
        <div className="flex items-center space-x-4">
          {/* Create Button */}
          <Button 
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>

          {/* Notifications */}
          <div className="relative">
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
              <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50 ${
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
                    <div key={notification.id} className={`px-4 py-3 border-b last:border-b-0 ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer`}>
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
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme} // Use the toggleTheme from context
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
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
      </header>

      <div className="flex">
        {/* Conditional Sidebar */}
        {shouldShowSidebar && (
          <aside className={`w-64 min-h-screen border-r ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
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

        {/* Main Content - Adjusts width based on sidebar visibility */}
        <main className={`flex-1 ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
          {children}
        </main>
      </div>

      {/* Simple Create Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-lg p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
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
                  className={`w-full p-3 rounded-md border ${
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