import React from 'react';
import { Button, Drawer, Form, Input, Space } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { useSharedTheme } from '@/contexts/ThemeContext'; // Import to access the global theme state
import type { DrawerClassNames, DrawerStyles } from 'antd/es/drawer/DrawerPanel';

// Types
interface Board {
  id: string;
  title: string;
  workspace: string;
  description?: string;
}

interface ProjectFormData {
  name: string;
  description: string;
}

interface CreateProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (values: ProjectFormData) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any; // Form instance from antd
}

const useStyle = createStyles(({ token, isDarkMode }) => {
  const backgroundColor = isDarkMode ? token.colorBgElevated : token.colorBgContainer;
  const borderColor = isDarkMode ? token.colorBorder : token.colorBorderSecondary;
  
  return {
    'project-drawer-body': {
      background: backgroundColor,
      padding: '24px',
      color: token.colorText,
    },
    'project-drawer-mask': {
      backdropFilter: 'blur(10px)',
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.45)',
    },
    'project-drawer-header': {
      background: backgroundColor,
      borderBottom: `1px solid ${borderColor}`,
      color: token.colorText,
    },
    'project-drawer-footer': {
      background: backgroundColor,
      borderTop: `1px solid ${borderColor}`,
      padding: '16px 24px',
    },
    'project-drawer-content': {
      background: backgroundColor,
      borderInlineStart: `2px solid ${borderColor}`,
    },
    'tip-container': {
      backgroundColor: isDarkMode ? token.colorInfoBg : token.colorBgContainer,
      borderRadius: token.borderRadius,
      border: `1px solid ${isDarkMode ? token.colorInfoBorder : token.colorBorder}`,
      color: token.colorText,
      transition: 'all 0.3s ease',
    },
    'form-input': {
      backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
      borderColor: isDarkMode ? token.colorBorder : token.colorBorderSecondary,
      color: token.colorText,
      '&:hover': {
        borderColor: token.colorPrimaryHover,
      },
      '&:focus': {
        borderColor: token.colorPrimary,
        boxShadow: `0 0 0 2px ${token.colorPrimary}14`,
      }
    },
    'form-textarea': {
      backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
      borderColor: isDarkMode ? token.colorBorder : token.colorBorderSecondary,
      color: token.colorText,
      '&:hover': {
        borderColor: token.colorPrimaryHover,
      },
      '&:focus': {
        borderColor: token.colorPrimary,
        boxShadow: `0 0 0 2px ${token.colorPrimary}14`,
      }
    }
  };
});

const CreateProjectDrawer: React.FC<CreateProjectDrawerProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  form
}) => {
  const { styles } = useStyle();
  const token = useTheme();
  const { isDarkMode } = useSharedTheme(); // Access global theme state

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onCreateProject(values);
      handleClose();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const classNames: DrawerClassNames = {
    body: styles['project-drawer-body'],
    mask: styles['project-drawer-mask'],
    header: styles['project-drawer-header'],
    footer: styles['project-drawer-footer'],
    content: styles['project-drawer-content'],
  };

  // Use the global isDarkMode from context instead of theme.isDarkMode for consistency
  const drawerStyles: DrawerStyles = {
    mask: {
      backdropFilter: 'blur(10px)',
      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.45)',
      transition: 'all 0.3s ease',
    },
    content: {
      boxShadow: isDarkMode ? token.boxShadowTertiary : token.boxShadowSecondary,
      backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
      transition: 'all 0.3s ease',
    },
    header: {
      borderBottom: `1px solid ${isDarkMode ? token.colorBorder : token.colorBorderSecondary}`,
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
      color: token.colorText,
      transition: 'all 0.3s ease',
    },
    body: {
      fontSize: token.fontSizeLG,
      backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
      color: token.colorText,
      transition: 'all 0.3s ease',
    },
    footer: {
      borderTop: `1px solid ${isDarkMode ? token.colorBorder : token.colorBorderSecondary}`,
      backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
      transition: 'all 0.3s ease',
    },
  };

  const footerContent = (
    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
      <Button 
        onClick={handleClose}
        style={{
          backgroundColor: 'transparent',
          borderColor: isDarkMode ? token.colorBorder : token.colorBorderSecondary,
          color: token.colorText,
        }}
      >
        Cancel
      </Button>
      <Button 
        type="primary" 
        onClick={handleSubmit}
        style={{
          backgroundColor: token.colorPrimary,
          borderColor: token.colorPrimary,
        }}
      >
        Create Project
      </Button>
    </Space>
  );

  return (
    <Drawer
      title="Create New Project"
      placement="right"
      width={420}
      onClose={handleClose}
      open={isOpen}
      classNames={classNames}
      styles={drawerStyles}
      footer={footerContent}
      destroyOnClose={true} // This helps with theme switching
      // Add a key that changes when theme changes to force re-render
      key={isDarkMode ? 'dark' : 'light'}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onCreateProject}
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="name"
          label={
            <span style={{ color: token.colorText, fontWeight: token.fontWeightStrong }}>
              Project Title
            </span>
          }
          rules={[
            { required: true, message: 'Please enter project title' },
            { min: 1, message: 'Project title cannot be empty' },
            { max: 100, message: 'Project title cannot exceed 100 characters' }
          ]}
        >
          <Input 
            placeholder="Enter your project title"
            size="large"
            className={styles['form-input']}
            style={{
              fontSize: token.fontSize,
              padding: '12px 16px',
              backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
              borderColor: isDarkMode ? token.colorBorder : token.colorBorderSecondary,
              color: token.colorText,
            }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={
            <span style={{ color: token.colorText, fontWeight: token.fontWeightStrong }}>
              Project Description
            </span>
          }
          rules={[
            { max: 500, message: 'Description cannot exceed 500 characters' }
          ]}
        >
          <Input.TextArea
            placeholder="Describe your project (optional)"
            rows={6}
            showCount
            maxLength={500}
            className={styles['form-textarea']}
            style={{
              fontSize: token.fontSize,
              padding: '12px 16px',
              resize: 'none',
              backgroundColor: isDarkMode ? token.colorBgElevated : token.colorBgContainer,
              borderColor: isDarkMode ? token.colorBorder : token.colorBorderSecondary,
              color: token.colorText,
            }}
          />
        </Form.Item>

        <div 
          className={styles['tip-container']}
          style={{ 
            marginTop: '24px', 
            padding: '16px',
            backgroundColor: isDarkMode ? token.colorBgElevated : token.colorFillQuaternary,
            borderColor: isDarkMode ? token.colorBorder : token.colorBorderSecondary,
          }}
        >
          <p style={{ 
            margin: 0, 
            fontSize: token.fontSizeSM, 
            color: token.colorTextSecondary,
            lineHeight: '1.5'
          }}>
            💡 <strong style={{ color: token.colorText }}>Tip:</strong> Choose a descriptive title that clearly identifies your project&apos;s purpose.
          </p>
        </div>
      </Form>
    </Drawer>
  );
};

export default CreateProjectDrawer;
export type { ProjectFormData, Board };