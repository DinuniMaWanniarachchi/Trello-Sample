"use client";

import React, { useState } from 'react';
import { Layout, Form, ConfigProvider, theme, Switch } from 'antd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MainHeader } from '@/components/common/MainHeader';
import { 
  Plus, 
  Settings, 
  Users, 
  CreditCard,
  Star,
  Clock,
  Home,
  Moon,
  Sun
} from 'lucide-react';
import CreateProjectDrawer, { ProjectFormData, Board } from '@/components/CreateProjectDrawer';

const { Header, Sider, Content } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

const HomePage = () => {
  const [, setIsCreateModalOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [boards, setBoards] = useState<Board[]>([
    { id: '1', title: 'My Kanban board', workspace: 'Kanban Workspace' }
  ]);
  const [form] = Form.useForm();

  // Ant Design theme configuration
  const themeConfig = {
    algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: '#1677ff',
      borderRadius: 6,
      colorBgContainer: isDarkMode ? '#141414' : '#ffffff',
      colorText: isDarkMode ? '#ffffff' : '#000000',
      colorTextSecondary: isDarkMode ? '#a6a6a6' : '#666666',
      colorBorder: isDarkMode ? '#434343' : '#d9d9d9',
      colorBgElevated: isDarkMode ? '#1f1f1f' : '#ffffff',
      colorBgLayout: isDarkMode ? '#000000' : '#f5f5f5',
    },
    components: {
      Layout: {
        headerBg: isDarkMode ? '#141414' : '#ffffff',
        siderBg: isDarkMode ? '#141414' : '#ffffff',
        bodyBg: isDarkMode ? '#000000' : '#f5f5f5',
      },
      Menu: {
        itemBg: 'transparent',
        itemHoverBg: isDarkMode ? '#262626' : '#f5f5f5',
        itemSelectedBg: isDarkMode ? '#1677ff' : '#e6f4ff',
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Also toggle the document class for shadcn components
    document.documentElement.classList.toggle('dark');
  };

  const handleCreateBoard = () => {
    if (boardTitle.trim()) {
      const newBoard: Board = {
        id: Date.now().toString(),
        title: boardTitle.trim(),
        workspace: 'Kanban Workspace'
      };
      
      setBoards(prev => [...prev, newBoard]);
      setBoardTitle('');
      setIsCreateModalOpen(false);
      
      // Navigate to the new board
      window.location.href = `/boards/${newBoard.id}`;
    }
  };

  const handleCreateProject = async (values: ProjectFormData) => {
    try {
      const newBoard: Board = {
        id: Date.now().toString(),
        title: values.name,
        workspace: 'Kanban Workspace',
        description: values.description
      };
      
      setBoards(prev => [...prev, newBoard]);
      setIsDrawerOpen(false);
      form.resetFields();
      
      console.log('Project created:', newBoard);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const navigateToBoard = (boardId: string) => {
    window.location.href = `/boards/${boardId}`;
  };

  const showDrawer = () => {
    setIsDrawerOpen(true);
  };

  const onCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Header */}
        <Header 
          style={{ 
            padding: '0 16px',
            height: 64,
            borderBottom: `1px solid ${themeConfig.token.colorBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <MainHeader />
          
          {/* Theme Toggle */}
          <div className="flex items-center space-x-3">
            {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
            />
          </div>
        </Header>
        
        <Layout>
          {/* Sidebar */}
          <Sider 
            width={256} 
            style={{
              borderRight: `1px solid ${themeConfig.token.colorBorder}`,
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <div className="p-4">
              <nav className="space-y-2">
                <a 
                  href="#" 
                  className="flex items-center space-x-3 rounded-lg p-2 transition-colors"
                  style={{
                    color: themeConfig.token.colorText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeConfig.components.Menu.itemHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </a>
                <a 
                  href="#" 
                  className="flex items-center space-x-3 rounded-lg p-2 transition-colors"
                  style={{
                    color: themeConfig.token.colorText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeConfig.components.Menu.itemHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>Boards</span>
                </a>
                <a 
                  href="#" 
                  className="flex items-center space-x-3 rounded-lg p-2 transition-colors"
                  style={{
                    color: themeConfig.token.colorText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeConfig.components.Menu.itemHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>Templates</span>
                </a>
              </nav>

              <div className="mt-8">
                <h3 
                  className="text-sm font-semibold mb-2"
                  style={{ color: themeConfig.token.colorText }}
                >
                  Workspaces
                </h3>
                <div className="space-y-2">
                  <div 
                    className="flex items-center space-x-2"
                    style={{ color: themeConfig.token.colorText }}
                  >
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: themeConfig.token.colorPrimary }}
                    >
                      T
                    </div>
                    <span className="text-sm">Kanban Workspace</span>
                  </div>
                  
                  <nav className="ml-8 space-y-1">
                    <a 
                      href="#" 
                      className="flex items-center space-x-2 text-sm transition-colors"
                      style={{ color: themeConfig.token.colorTextSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorTextSecondary;
                      }}
                    >
                      <span>Boards</span>
                    </a>
                    <a 
                      href="#" 
                      className="flex items-center space-x-2 text-sm transition-colors"
                      style={{ color: themeConfig.token.colorTextSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorTextSecondary;
                      }}
                    >
                      <Users className="h-4 w-4" />
                      <span>Members</span>
                    </a>
                    <a 
                      href="#" 
                      className="flex items-center space-x-2 text-sm transition-colors"
                      style={{ color: themeConfig.token.colorTextSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorTextSecondary;
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </a>
                    <a 
                      href="#" 
                      className="flex items-center space-x-2 text-sm transition-colors"
                      style={{ color: themeConfig.token.colorTextSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeConfig.token.colorTextSecondary;
                      }}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Billing</span>
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </Sider>

          {/* Main Content */}
          <Content style={{ padding: '32px' }}>
            <div className="max-w-4xl mx-auto">
              {/* Your Items Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-lg font-semibold flex items-center"
                    style={{ color: themeConfig.token.colorText }}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Your Items
                  </h2>
                </div>
              </div>

              {/* Organize Anything Section */}
              <div className="text-center mb-8">
                <div 
                  className="backdrop-blur-sm rounded-lg p-8 mb-6 shadow-sm"
                  style={{
                    backgroundColor: themeConfig.token.colorBgElevated,
                    border: `1px solid ${themeConfig.token.colorBorder}`
                  }}
                >
                  <div className="mb-6">
                    <div 
                      className="w-48 h-32 mx-auto rounded-lg relative overflow-hidden"
                      style={{
                        backgroundColor: isDarkMode ? '#722ed1' : '#d3adf7'
                      }}
                    >
                      <div className="absolute inset-4 space-y-2">
                        <div 
                          className="rounded p-2 shadow-sm"
                          style={{
                            backgroundColor: themeConfig.token.colorBgContainer,
                            border: `1px solid ${themeConfig.token.colorBorder}`
                          }}
                        >
                          <div 
                            className="h-2 rounded mb-1"
                            style={{ backgroundColor: themeConfig.token.colorBorder }}
                          ></div>
                          <div 
                            className="h-2 rounded w-2/3"
                            style={{ backgroundColor: themeConfig.token.colorBorder }}
                          ></div>
                        </div>
                        <div 
                          className="rounded p-2 shadow-sm flex items-center justify-center"
                          style={{
                            backgroundColor: isDarkMode ? '#0d1117' : '#e6f4ff',
                            border: `1px solid ${isDarkMode ? '#1677ff' : '#91caff'}`
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: themeConfig.token.colorPrimary }}
                          ></div>
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: themeConfig.token.colorPrimary }}
                          ></div>
                        </div>
                        <div 
                          className="rounded p-2 shadow-sm"
                          style={{
                            backgroundColor: isDarkMode ? '#162312' : '#f6ffed',
                            border: `1px solid ${isDarkMode ? '#52c41a' : '#b7eb8f'}`
                          }}
                        >
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: '#52c41a' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ color: themeConfig.token.colorText }}
                  >
                    Organize anything
                  </h3>
                  <p 
                    className="mb-6"
                    style={{ color: themeConfig.token.colorTextSecondary }}
                  >
                    Put everything in one place and start moving things forward with your first Kanban board!
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Input 
                        value={boardTitle}
                        onChange={(e) => setBoardTitle(e.target.value)}
                        placeholder="What are you working on?"
                        className="max-w-md"
                        style={{
                          backgroundColor: themeConfig.token.colorBgContainer,
                          borderColor: themeConfig.token.colorBorder,
                          color: themeConfig.token.colorText
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateBoard();
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <Button 
                        onClick={handleCreateBoard}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={!boardTitle.trim()}
                      >
                        Create your board
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="underline"
                        style={{ color: themeConfig.token.colorText }}
                      >
                        Got it! Dismiss this.
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recently Viewed Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-lg font-semibold flex items-center"
                    style={{ color: themeConfig.token.colorText }}
                  >
                    <Star className="h-5 w-5 mr-2" />
                    Recently viewed
                  </h2>
                  <Button 
                    variant="ghost" 
                    onClick={showDrawer}
                    style={{ color: themeConfig.token.colorText }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create a board
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boards.map((board) => (
                    <Card 
                      key={board.id} 
                      className="backdrop-blur-sm cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: themeConfig.token.colorBgElevated,
                        borderColor: themeConfig.token.colorBorder
                      }}
                      onClick={() => navigateToBoard(board.id)}
                    >
                      <CardContent className="p-4">
                        <h3 
                          className="font-medium mb-1"
                          style={{ color: themeConfig.token.colorText }}
                        >
                          {board.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: themeConfig.token.colorTextSecondary }}
                        >
                          {board.workspace}
                        </p>
                        {board.description && (
                          <p 
                            className="text-xs mt-2 truncate"
                            style={{ color: themeConfig.token.colorTextSecondary }}
                          >
                            {board.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Content>
        </Layout>

        {/* Create Project Drawer */}
        <CreateProjectDrawer
          isOpen={isDrawerOpen}
          onClose={onCloseDrawer}
          onCreateProject={handleCreateProject}
          form={form}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default HomePage;