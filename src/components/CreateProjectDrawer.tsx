import React from 'react';
import { Button, Drawer, Form, Input, Space } from 'antd';
import { createStyles, useTheme } from 'antd-style';
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

const useStyle = createStyles(({ token }) => ({
  'project-drawer-body': {
    background: token.blue1,
    padding: '24px',
  },
  'project-drawer-mask': {
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  'project-drawer-header': {
    background: token.green1,
    borderBottom: `1px solid ${token.colorPrimary}`,
  },
  'project-drawer-footer': {
    background: token.colorBgContainer,
    borderTop: `1px solid ${token.colorBorder}`,
    padding: '16px 24px',
  },
  'project-drawer-content': {
    borderInlineStart: '2px dotted #333',
  },
}));

const CreateProjectDrawer: React.FC<CreateProjectDrawerProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  form
}) => {
  const { styles } = useStyle();
  const token = useTheme();

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

  const drawerStyles: DrawerStyles = {
    mask: {
      backdropFilter: 'blur(10px)',
    },
    content: {
      boxShadow: '-10px 0 10px #666',
    },
    header: {
      borderBottom: `1px solid ${token.colorPrimary}`,
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
    },
    body: {
      fontSize: token.fontSizeLG,
    },
    footer: {
      borderTop: `1px solid ${token.colorBorder}`,
    },
  };

  const footerContent = (
    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
      <Button onClick={handleClose}>
        Cancel
      </Button>
      <Button type="primary" onClick={handleSubmit}>
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
          label="Project Title"
          rules={[
            { required: true, message: 'Please enter project title' },
            { min: 1, message: 'Project title cannot be empty' },
            { max: 100, message: 'Project title cannot exceed 100 characters' }
          ]}
        >
          <Input 
            placeholder="Enter your project title"
            size="large"
            style={{
              fontSize: token.fontSize,
              padding: '12px 16px',
            }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Project Description"
          rules={[
            { max: 500, message: 'Description cannot exceed 500 characters' }
          ]}
        >
          <Input.TextArea
            placeholder="Describe your project (optional)"
            rows={6}
            showCount
            maxLength={500}
            style={{
              fontSize: token.fontSize,
              padding: '12px 16px',
              resize: 'none',
            }}
          />
        </Form.Item>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: token.colorInfoBg, 
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorInfoBorder}`
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: token.fontSizeSM, 
            color: token.colorTextSecondary 
          }}>
            💡 <strong>Tip:</strong> Choose a descriptive title that clearly identifies your project&apos;s purpose.
          </p>
        </div>
      </Form>
    </Drawer>
  );
};

export default CreateProjectDrawer;
export type { ProjectFormData, Board };