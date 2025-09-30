export type TaskLabelType = 
  | 'awaiting_review'
  | 'critical'
  | 'documentation'
  | 'duplicate'
  | 'fixed'
  | 'fixing'
  | 'ready_for_dev'
  | 'regression'
  | 'ui_ux_bugs';

export interface TaskLabel {
  id: string;
  name: string;
  type: TaskLabelType;
  color: string;
}

export const PREDEFINED_LABELS: TaskLabel[] = [
  {
    id: 'label_awaiting_review',
    name: 'Awaiting review',
    type: 'awaiting_review',
    color: '#FFA500' // Orange
  },
  {
    id: 'label_critical',
    name: 'Critical',
    type: 'critical',
    color: '#FF0000' // Red
  },
  {
    id: 'label_documentation',
    name: 'Documentation',
    type: 'documentation',
    color: '#9B59B6' // Purple
  },
  {
    id: 'label_duplicate',
    name: 'Duplicate',
    type: 'duplicate',
    color: '#95A5A6' // Gray
  },
  {
    id: 'label_fixed',
    name: 'Fixed',
    type: 'fixed',
    color: '#27AE60' // Green
  },
  {
    id: 'label_fixing',
    name: 'Fixing',
    type: 'fixing',
    color: '#F1C40F' // Yellow
  },
  {
    id: 'label_ready_for_dev',
    name: 'Ready for Dev',
    type: 'ready_for_dev',
    color: '#3498DB' // Blue
  },
  {
    id: 'label_regression',
    name: 'Regression',
    type: 'regression',
    color: '#E74C3C' // Dark Red
  },
  {
    id: 'label_ui_ux_bugs',
    name: 'UI/UX bugs',
    type: 'ui_ux_bugs',
    color: '#E91E63' // Pink
  }
];

export interface TaskWithLabels {
  id: string;
  labels: TaskLabelType[];
}