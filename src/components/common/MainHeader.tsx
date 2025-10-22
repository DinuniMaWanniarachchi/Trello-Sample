/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-html-link-for-pages */
// components/common/MainHeader.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { Button, Drawer, Input, Form, Card, Row, Col, message } from 'antd';
import { Button as UIButton } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { 
  Globe, 
  Loader2,
  Plus,
  Home,
  Layout,
  FileText,
  Menu,
  X} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { SupportedLanguage } from '@/i18n';

const { TextArea } = Input;

interface Language {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

interface BoardTemplate {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
}

const boardTemplates: BoardTemplate[] = [
  {
    id: 'kanban',
    title: 'Kanban Board',
    description: 'Organize tasks with To Do, Doing, and Done columns',
    image: '📋',
    color: '#4F46E5'
  },
  {
    id: 'project',
    title: 'Project Management',
    description: 'Plan and track your project milestones',
    image: '🚀',
    color: '#059669'
  },
  {
    id: 'team',
    title: 'Team Collaboration',
    description: 'Coordinate work across your team',
    image: '👥',
    color: '#DC2626'
  },
  {
    id: 'personal',
    title: 'Personal Tasks',
    description: 'Keep track of your daily tasks and goals',
    image: '✅',
    color: '#7C3AED'
  },
  {
    id: 'marketing',
    title: 'Marketing Campaign',
    description: 'Plan and execute your marketing strategies',
    image: '📊',
    color: '#EA580C'
  },
  {
    id: 'development',
    title: 'Software Development',
    description: 'Manage your development workflow',
    image: '💻',
    color: '#0891B2'
  }
];

export const LanguageDropdown = () => {
  const { i18n, ready } = useTranslation();
  useTheme();
  const [loading, setLoading] = useState<SupportedLanguage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  if (!ready || !i18n) {
    return (
      <UIButton variant="ghost" size="sm" disabled className="text-foreground/70 h-8 w-8 sm:w-auto sm:px-2">
        <Globe className="h-3.5 w-3.5" />
      </UIButton>
    );
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = useCallback(async (languageCode: SupportedLanguage) => {
    if (languageCode === i18n.language || loading) return;

    setLoading(languageCode);
    setError(null);

    try {
      console.log(`Changing language to: ${languageCode}`);
      await i18n.changeLanguage(languageCode);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', languageCode);
      }
      
      console.log(`Successfully changed language to: ${languageCode}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change language';
      setError(errorMessage);
      console.error('Language change error:', err);
    } finally {
      setLoading(null);
    }
  }, [i18n, loading]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UIButton 
          variant="ghost" 
          size="sm" 
          className="text-foreground/80 hover:text-foreground hover:bg-accent h-8 w-8 sm:w-auto sm:px-2 text-xs font-medium"
          disabled={loading !== null}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Globe className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden lg:inline">{currentLanguage.flag} {currentLanguage.name}</span>
              <span className="hidden sm:inline lg:hidden">{currentLanguage.flag}</span>
            </>
          )}
        </UIButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => {
          const isActive = i18n.language === language.code;
          const isLoading = loading === language.code;
          
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer text-sm ${
                isActive ? 'bg-accent' : ''
              }`}
              disabled={loading !== null}
            >
              <span className="mr-2">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              <div className="flex items-center gap-1">
                {isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                )}
                {isActive && !isLoading && (
                  <span className="text-green-500 text-xs">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        {error && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-xs text-red-500">
              {error}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CreateButton = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const onClose = () => {
    setDrawerOpen(false);
    setSelectedTemplate(null);
    form.resetFields();
  };

  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template);
    form.setFieldValue('title', template.title);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateBoard = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const boardData = {
        title: values.title,
        description: values.description || '',
        template: selectedTemplate?.id || 'kanban',
        templateColor: selectedTemplate?.color || '#4F46E5'
      };
      
      console.log('Creating board with data:', boardData);
      message.success(`Board "${values.title}" created successfully!`);
      
      // Here you would typically:
      // 1. Call your API to create the board
      // 2. Navigate to the new board
      // 3. Update your app state
      
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error('Failed to create board. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoardClick = () => {
    setSelectedTemplate(boardTemplates[0]); // Default to Kanban
    form.setFieldValue('title', boardTemplates[0].title);
    showDrawer();
  };

  // Get drawer width based on screen size
  const getDrawerWidth = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return '100%'; // Full width on mobile
      if (window.innerWidth < 768) return '90%';  // 90% on small tablets
      return 480; // Fixed width on larger screens
    }
    return 480;
  };

  // Theme-aware styles
  const drawerBodyStyle = {
    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
    color: theme === 'dark' ? '#fff' : '#000',
    padding: typeof window !== 'undefined' && window.innerWidth < 640 ? '16px' : '24px'
  };

  const drawerHeaderStyle = {
    backgroundColor: theme === 'dark' ? '#27272a' : '#f4f4f5',
    borderBottom: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e4e4e7'
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <UIButton 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 w-8 sm:w-auto sm:px-3 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Create</span>
          </UIButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem 
            className="cursor-pointer text-sm"
            onClick={handleCreateBoardClick}
          >
            <Layout className="h-3.5 w-3.5 mr-2" />
            Create Board
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-sm">
            <FileText className="h-3.5 w-3.5 mr-2" />
            Create Template
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-sm">
            <Plus className="h-3.5 w-3.5 mr-2" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Drawer
        title={
          <div style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: '18px', fontWeight: '600' }}>
            Create New Board
          </div>
        }
        placement="right"
        width={getDrawerWidth()}
        onClose={onClose}
        open={drawerOpen}
        styles={{
          body: drawerBodyStyle,
          header: drawerHeaderStyle
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBoard}
          initialValues={{ title: '', description: '' }}
        >
          {/* Board Templates Selection */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              color: theme === 'dark' ? '#fff' : '#000', 
              marginBottom: '16px', 
              fontSize: '16px', 
              fontWeight: '500' 
            }}>
              Choose a Template
            </h3>
            <Row gutter={[12, 12]}>
              {boardTemplates.map((template) => (
                <Col xs={24} sm={12} key={template.id}>
                  <Card
                    hoverable
                    style={{
                      backgroundColor: selectedTemplate?.id === template.id 
                        ? template.color + '20' 
                        : theme === 'dark' ? '#27272a' : '#f9f9f9',
                      border: selectedTemplate?.id === template.id 
                        ? `2px solid ${template.color}` 
                        : theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e4e4e7',
                      borderRadius: '8px',
                      minHeight: '120px',
                      cursor: 'pointer'
                    }}
                    bodyStyle={{ padding: '16px', textAlign: 'center' }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                      {template.image}
                    </div>
                    <div style={{ 
                      color: theme === 'dark' ? '#fff' : '#000', 
                      fontWeight: '500', 
                      fontSize: '14px', 
                      marginBottom: '4px' 
                    }}>
                      {template.title}
                    </div>
                    <div style={{ 
                      color: theme === 'dark' ? '#a1a1aa' : '#71717a', 
                      fontSize: '12px', 
                      lineHeight: '1.3' 
                    }}>
                      {template.description}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          {/* Board Details Form */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              color: theme === 'dark' ? '#fff' : '#000', 
              marginBottom: '16px', 
              fontSize: '16px', 
              fontWeight: '500' 
            }}>
              Board Details
            </h3>
            
            <Form.Item
              label={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Board Title</span>}
              name="title"
              rules={[{ required: true, message: 'Please enter board title!' }]}
            >
              <Input
                placeholder="Enter board title"
                style={{
                  backgroundColor: theme === 'dark' ? '#27272a' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e4e4e7',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Description (Optional)</span>}
              name="description"
            >
              <TextArea
                rows={3}
                placeholder="Describe what this board is for..."
                style={{
                  backgroundColor: theme === 'dark' ? '#27272a' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e4e4e7',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}
              />
            </Form.Item>
          </div>

          {/* Selected Template Preview */}
          {selectedTemplate && (
            <div style={{ 
              marginBottom: '24px', 
              padding: '16px', 
              backgroundColor: theme === 'dark' ? '#27272a' : '#f9f9f9', 
              borderRadius: '8px',
              border: `1px solid ${selectedTemplate.color}50`
            }}>
              <h4 style={{ 
                color: theme === 'dark' ? '#fff' : '#000', 
                marginBottom: '8px', 
                fontSize: '14px' 
              }}>
                Selected Template:
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>{selectedTemplate.image}</div>
                <div>
                  <div style={{ color: selectedTemplate.color, fontWeight: '500' }}>
                    {selectedTemplate.title}
                  </div>
                  <div style={{ 
                    color: theme === 'dark' ? '#a1a1aa' : '#71717a', 
                    fontSize: '12px' 
                  }}>
                    {selectedTemplate.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            flexDirection: typeof window !== 'undefined' && window.innerWidth < 640 ? 'column' : 'row'
          }}>
            <Button 
              onClick={onClose} 
              style={{ 
                backgroundColor: 'transparent', 
                border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e4e4e7',
                color: theme === 'dark' ? '#fff' : '#000',
                order: typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 1
              }}
              block={typeof window !== 'undefined' && window.innerWidth < 640}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                backgroundColor: selectedTemplate?.color || '#3b82f6',
                border: 'none',
                fontWeight: '500',
                order: typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2
              }}
              disabled={!selectedTemplate}
              block={typeof window !== 'undefined' && window.innerWidth < 640}
            >
              {loading ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </>
  );
};

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();

  const drawerBodyStyle = {
    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
    color: theme === 'dark' ? '#fff' : '#000',
    padding: '16px'
  };

  const drawerHeaderStyle = {
    backgroundColor: theme === 'dark' ? '#27272a' : '#f4f4f5',
    borderBottom: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e4e4e7'
  };

  return (
    <>
      <UIButton 
        variant="ghost" 
        size="sm" 
        className="lg:hidden text-foreground hover:bg-accent h-8 w-8 p-0"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </UIButton>

      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span style={{ 
              color: theme === 'dark' ? '#fff' : '#000', 
              fontSize: '18px', 
              fontWeight: '600' 
            }}>
              Menu
            </span>
            <UIButton 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="text-foreground hover:bg-accent h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </UIButton>
          </div>
        }
        placement="left"
        width={280}
        onClose={() => setIsOpen(false)}
        open={isOpen}
        styles={{
          body: drawerBodyStyle,
          header: drawerHeaderStyle
        }}
        closable={false}
      >
        <nav className="space-y-4">
          <a 
            href="/" 
            className="flex items-center space-x-3 text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2 rounded-md transition-colors duration-150 text-sm font-medium"
            onClick={() => setIsOpen(false)}
          >
            <Home className="h-4 w-4" />
            <span>{t('home', { defaultValue: 'Home' })}</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2 rounded-md transition-colors duration-150 text-sm font-medium"
            onClick={() => setIsOpen(false)}
          >
            <Layout className="h-4 w-4" />
            <span>{t('boards', { defaultValue: 'Boards' })}</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 text-foreground/80 hover:text-foreground hover:bg-accent px-3 py-2 rounded-md transition-colors duration-150 text-sm font-medium"
            onClick={() => setIsOpen(false)}
          >
            <FileText className="h-4 w-4" />
            <span>{t('templates', { defaultValue: 'Templates' })}</span>
          </a>
        </nav>
        
        <div className="mt-8 pt-4 border-t border-border">
          <div className="space-y-3">
            <div className="text-foreground/60 text-xs font-medium uppercase tracking-wider">
              Settings
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export const MainHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="bg-background border-b border-border font-['Inter',sans-serif]">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4 lg:space-x-6 min-w-0 flex-1">
            {/* Logo */}
            <div className="flex items-center space-x-0 flex-shrink-0">
              <span className="text-base sm:text-lg font-semibold text-foreground">
                Kanban
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4 min-w-0">
              <a 
                href="/" 
                className="text-foreground/80 hover:text-foreground flex items-center space-x-1.5 px-2 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium whitespace-nowrap"
              >
                <Home className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{t('home', { defaultValue: 'Home' })}</span>
              </a>
              <a 
                href="#" 
                className="text-foreground/80 hover:text-foreground px-2 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium whitespace-nowrap"
              >
                {t('boards', { defaultValue: 'Boards' })}
              </a>
              <a 
                href="#" 
                className="text-foreground/80 hover:text-foreground px-2 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium whitespace-nowrap"
              >
                {t('templates', { defaultValue: 'Templates' })}
              </a>
            </nav>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Language Selector */}
            <LanguageDropdown />
            
            {/* Theme Toggle - Hidden on mobile */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* Create Button */}
            <CreateButton />
            
            {/* Mobile menu button */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};