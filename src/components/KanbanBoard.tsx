// components/KanbanBoard.tsx
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  description?: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

interface KanbanBoardProps {
  initialData?: Column[];
}

// Sortable Card Component
const SortableCard: React.FC<{
  card: Card;
  columnId: string;
  editingCard: { columnId: string; cardId: string } | null;
  setEditingCard: (value: { columnId: string; cardId: string } | null) => void;
  updateCard: (columnId: string, cardId: string, title: string, description: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  t: (key: string) => string;
}> = ({ card, columnId, editingCard, setEditingCard, updateCard, deleteCard, t }) => {
  const isDragging = false;

  if (editingCard?.columnId === columnId && editingCard?.cardId === card.id) {
    return (
      <div
        className="bg-white dark:bg-gray-700 p-3 rounded-md mb-3 shadow-sm border"
      >
        <div className="space-y-2">
          <input
            type="text"
            defaultValue={card.title}
            placeholder={t('kanban.cardTitle')}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const title = e.currentTarget.value;
                const description = (e.currentTarget.nextElementSibling as HTMLTextAreaElement)?.value || '';
                updateCard(columnId, card.id, title, description);
              }
            }}
          />
          <textarea
            defaultValue={card.description}
            placeholder={t('kanban.cardDescription')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                const titleInput = e.currentTarget.parentElement?.parentElement?.querySelector('input') as HTMLInputElement;
                const descInput = e.currentTarget.parentElement?.parentElement?.querySelector('textarea') as HTMLTextAreaElement;
                updateCard(columnId, card.id, titleInput.value, descInput.value);
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              {t('kanban.save')}
            </button>
            <button
              onClick={() => setEditingCard(null)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              {t('kanban.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-700 p-3 rounded-md mb-3 shadow-sm border hover:shadow-md transition-all group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
          {card.title}
        </h4>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingCard({ columnId, cardId: card.id })}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded mr-1"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => deleteCard(columnId, card.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-600"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      {card.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {card.description}
        </p>
      )}
    </div>
  );
};

// Droppable Column Component
const DroppableColumn: React.FC<{
  column: Column;
  editingColumn: string | null;
  setEditingColumn: (value: string | null) => void;
  updateColumnTitle: (columnId: string, newTitle: string) => void;
  deleteColumn: (columnId: string) => void;
  editingCard: { columnId: string; cardId: string } | null;
  setEditingCard: (value: { columnId: string; cardId: string } | null) => void;
  updateCard: (columnId: string, cardId: string, title: string, description: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  addCard: (columnId: string) => void;
  newCardTitle: string;
  setNewCardTitle: (value: string) => void;
  newCardDescription: string;
  setNewCardDescription: (value: string) => void;
  t: (key: string) => string;
}> = ({
  column,
  editingColumn,
  setEditingColumn,
  updateColumnTitle,
  deleteColumn,
  editingCard,
  setEditingCard,
  updateCard,
  deleteCard,
  addCard,
  newCardTitle,
  setNewCardTitle,
  newCardDescription,
  setNewCardDescription,
  t,
}) => {
  return (
    <div
      className={`bg-gray-100 dark:bg-gray-800 rounded-md p-4 min-w-[300px] flex-shrink-0 transition-colors`}
    >
      <div className="flex items-center justify-between mb-4">
        {editingColumn === column.id ? (
          <input
            type="text"
            defaultValue={column.title}
            className="font-semibold text-lg bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white"
            onBlur={(e) => updateColumnTitle(column.id, e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                updateColumnTitle(column.id, e.currentTarget.value);
              }
            }}
            autoFocus
          />
        ) : (
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {column.title}
          </h3>
        )}
        
        <div className="relative group">
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <MoreVertical size={16} />
          </button>
          <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 shadow-lg rounded-md py-2 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={() => setEditingColumn(column.id)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left text-sm"
            >
              <Edit2 size={14} />
              {t('common.edit')}
            </button>
            <button
              onClick={() => deleteColumn(column.id)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left text-sm text-red-600"
            >
              <Trash2 size={14} />
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[200px] rounded-lg transition-colors">
        {column.cards.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>{t('kanban.noCards')}</p>
            <p className="text-sm mt-1">{t('kanban.addFirstCard')}</p>
          </div>
        ) : (
          column.cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              columnId={column.id}
              editingCard={editingCard}
              setEditingCard={setEditingCard}
              updateCard={updateCard}
              deleteCard={deleteCard}
              t={t}
            />
          ))
        )}
      </div>

      <button
        onClick={() => setEditingCard({ columnId: column.id, cardId: 'new' })}
        className="w-full mt-3 p-2 text-gray-600 dark:text-gray-300 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        + {t('kanban.addCard')}
      </button>

      {editingCard?.columnId === column.id && editingCard?.cardId === 'new' && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border space-y-2">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder={t('kanban.cardTitle')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            value={newCardDescription}
            onChange={(e) => setNewCardDescription(e.target.value)}
            placeholder={t('kanban.cardDescription')}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => addCard(column.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              {t('kanban.save')}
            </button>
            <button
              onClick={() => {
                setEditingCard(null);
                setNewCardTitle('');
                setNewCardDescription('');
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              {t('kanban.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialData = [] }) => {
  const { t } = useTranslation('common');
  const [columns, setColumns] = useState<Column[]>(initialData.length > 0 ? initialData : [
    {
      id: 'todo',
      title: 'To Do',
      cards: []
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      cards: []
    },
    {
      id: 'done',
      title: 'Done',
      cards: []
    }
  ]);
  
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<{ columnId: string; cardId: string } | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');

  const findColumn = (id: string) => {
    return columns.find(column => 
      column.id === id || column.cards.some(card => card.id === id)
    );
  };

  const findCard = (id: string) => {
    for (const column of columns) {
      const card = column.cards.find(card => card.id === id);
      if (card) {
        return { card, column };
      }
    }
    return null;
  };

  const addColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumn: Column = {
        id: Date.now().toString(),
        title: newColumnTitle,
        cards: []
      };
      setColumns([...columns, newColumn]);
      setNewColumnTitle('');
      setShowAddColumn(false);
    }
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(columns.map(col =>
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
    setEditingColumn(null);
  };

  const deleteColumn = (columnId: string) => {
    if (confirm(t('kanban.confirmDeleteColumn'))) {
      setColumns(columns.filter(col => col.id !== columnId));
    }
  };

  const addCard = (columnId: string) => {
    if (newCardTitle.trim()) {
      const newCard: Card = {
        id: Date.now().toString(),
        title: newCardTitle,
        description: newCardDescription
      };
      
      setColumns(columns.map(col =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      ));
      
      setNewCardTitle('');
      setNewCardDescription('');
      setEditingCard(null);
    }
  };

  const updateCard = (columnId: string, cardId: string, title: string, description: string) => {
    setColumns(columns.map(col =>
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { ...card, title, description }
                : card
            )
          }
        : col
    ));
    setEditingCard(null);
  };

  const deleteCard = (columnId: string, cardId: string) => {
    if (confirm(t('kanban.confirmDeleteCard'))) {
      setColumns(columns.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
          : col
      ));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('kanban.title')}
        </h1>
        <button
          onClick={() => setShowAddColumn(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          {t('kanban.addColumn')}
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {t('kanban.dragDropHint')}
      </p>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            editingColumn={editingColumn}
            setEditingColumn={setEditingColumn}
            updateColumnTitle={updateColumnTitle}
            deleteColumn={deleteColumn}
            editingCard={editingCard}
            setEditingCard={setEditingCard}
            updateCard={updateCard}
            deleteCard={deleteCard}
            addCard={addCard}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            newCardDescription={newCardDescription}
            setNewCardDescription={setNewCardDescription}
            t={t}
          />
        ))}

        {/* Add Column Section */}
        {showAddColumn && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-w-[300px] flex-shrink-0">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder={t('kanban.columnTitle')}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addColumn}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {t('kanban.save')}
              </button>
              <button
                onClick={() => {
                  setShowAddColumn(false);
                  setNewColumnTitle('');
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                {t('kanban.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;