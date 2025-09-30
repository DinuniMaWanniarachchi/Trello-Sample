import { TaskLabelType, PREDEFINED_LABELS, TaskLabel } from '@/types/taskLabels';

/**
 * Get label details by type
 */
export const getLabelByType = (type: TaskLabelType): TaskLabel | undefined => {
  return PREDEFINED_LABELS.find(label => label.type === type);
};

/**
 * Get multiple label details by types
 */
export const getLabelsByTypes = (types: TaskLabelType[]): TaskLabel[] => {
  return types
    .map(type => getLabelByType(type))
    .filter((label): label is TaskLabel => label !== undefined);
};

/**
 * Get label color by type
 */
export const getLabelColor = (type: TaskLabelType): string => {
  const label = getLabelByType(type);
  return label?.color || '#888888';
};

/**
 * Get label name by type
 */
export const getLabelName = (type: TaskLabelType): string => {
  const label = getLabelByType(type);
  return label?.name || type;
};

/**
 * Filter labels by search term
 */
export const filterLabels = (searchTerm: string): TaskLabel[] => {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) {
    return PREDEFINED_LABELS;
  }
  
  return PREDEFINED_LABELS.filter(label =>
    label.name.toLowerCase().includes(term) ||
    label.type.toLowerCase().includes(term)
  );
};

/**
 * Sort labels by name
 */
export const sortLabelsByName = (labels: TaskLabel[]): TaskLabel[] => {
  return [...labels].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Group tasks by label
 */
export const groupTasksByLabel = (
  tasks: Array<{ id: string; labels: TaskLabelType[] }>
): Record<TaskLabelType, string[]> => {
  const grouped: Record<string, string[]> = {};
  
  PREDEFINED_LABELS.forEach(label => {
    grouped[label.type] = [];
  });
  
  tasks.forEach(task => {
    task.labels.forEach(labelType => {
      if (grouped[labelType]) {
        grouped[labelType].push(task.id);
      }
    });
  });
  
  return grouped as Record<TaskLabelType, string[]>;
};

/**
 * Check if a task has a specific label
 */
export const taskHasLabel = (
  taskLabels: TaskLabelType[],
  labelType: TaskLabelType
): boolean => {
  return taskLabels.includes(labelType);
};

/**
 * Get contrast text color for a background color
 */
export const getContrastTextColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Validate label type
 */
export const isValidLabelType = (type: string): type is TaskLabelType => {
  return PREDEFINED_LABELS.some(label => label.type === type);
};