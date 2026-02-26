'use client';

import { useState, useRef } from 'react';
import { Category } from '@/src/types';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { updateCategory, deleteCategory } from '@/src/store/slices/boardSlice';
import { TicketCard } from './TicketCard';
import { DropIndicator } from './DropIndicator';
import { CreateTicketModal } from './CreateTicketModal';
import { DragState } from '@/src/hooks/useDragAndDrop';

interface CategoryColumnProps {
  category: Category;
  dragState: DragState;
  onCategoryDragStart: (e: React.DragEvent, categoryId: string) => void;
  onCategoryDragEnd: () => void;
  onColumnDragOver: (e: React.DragEvent, categoryId: string) => void;
  onColumnDrop: (e: React.DragEvent, categoryId: string) => void;
  onTicketDragStart: (e: React.DragEvent, ticketId: string, categoryId: string) => void;
  onTicketDragEnd: () => void;
  onTicketDragOver: (e: React.DragEvent, categoryId: string, tickets: { id: string }[]) => void;
  onTicketDrop: (e: React.DragEvent, categoryId: string, tickets: { id: string; categoryId: string }[]) => void;
  onDragEnter: (e: React.DragEvent, categoryId: string) => void;
  onDragLeave: (e: React.DragEvent, categoryId: string) => void;
}

export function CategoryColumn({
  category,
  dragState,
  onCategoryDragStart,
  onCategoryDragEnd,
  onColumnDragOver,
  onColumnDrop,
  onTicketDragStart,
  onTicketDragEnd,
  onTicketDragOver,
  onTicketDrop,
  onDragEnter,
  onDragLeave,
}: CategoryColumnProps) {
  const dispatch = useAppDispatch();
  const tickets = useAppSelector((state) =>
    state.tickets.tickets
      .filter((t) => t.categoryId === category.id)
      .slice()
      .sort((a, b) => a.position - b.position)
  );

  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(category.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== category.name) {
      dispatch(updateCategory({ id: category.id, name: trimmed }));
    } else {
      setNameValue(category.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setNameValue(category.name);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    dispatch(deleteCategory(category.id));
    setShowDeleteConfirm(false);
  };

  const isColumnBeingDragged = dragState.draggedCategoryId === category.id;
  const isColumnDragTarget =
    dragState.dragType === 'category' &&
    dragState.highlightedCategoryId === category.id &&
    dragState.draggedCategoryId !== category.id;
  const isTicketDropTarget =
    dragState.dragType === 'ticket' &&
    dragState.dropTargetCategoryId === category.id;

  return (
    <>
    <div
      onDragOver={(e) => {
        if (dragState.dragType === 'category') {
          onColumnDragOver(e, category.id);
        }
      }}
      onDrop={(e) => {
        if (dragState.dragType === 'category') {
          onColumnDrop(e, category.id);
        }
      }}
      onDragEnter={(e) => onDragEnter(e, category.id)}
      onDragLeave={(e) => onDragLeave(e, category.id)}
      className="w-80 flex-shrink-0 rounded-xl shadow-sm flex flex-col transition-all duration-150"
      style={{
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: isColumnDragTarget ? '#dbeafe' : '#f3f4f6',
        outline: isColumnDragTarget ? '2px solid #3b82f6' : undefined,
        opacity: isColumnBeingDragged ? 0.5 : 1,
      }}
    >
      <div
        draggable={!isEditing}
        onDragStart={(e) => !isEditing && onCategoryDragStart(e, category.id)}
        onDragEnd={() => onCategoryDragEnd()}
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-grab active:cursor-grabbing"
        style={{ borderLeftWidth: 4, borderLeftColor: category.color, borderLeftStyle: 'solid', borderRadius: '0.75rem 0.75rem 0 0' }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white border border-gray-300 rounded px-2 py-0.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span
              onDoubleClick={handleDoubleClick}
              className="flex-1 text-sm font-semibold text-gray-800 truncate select-none"
              title="Double-click to edit, drag to reorder"
            >
              {category.name}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5 font-medium flex-shrink-0">
            {tickets.length}
          </span>
        </div>

        <div className="relative ml-2">
          {!showDeleteConfirm ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-gray-200"
              title="Delete column"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 px-3 py-2 flex flex-col overflow-y-auto"
        style={{ gap: 0 }}
        onDragOver={(e) => {
          if (dragState.dragType === 'ticket') {
            onTicketDragOver(e, category.id, tickets);
          }
        }}
        onDrop={(e) => {
          if (dragState.dragType === 'ticket') {
            onTicketDrop(e, category.id, tickets);
          }
        }}
      >
        {isTicketDropTarget && dragState.dropPosition === 0 && (
          <DropIndicator color={category.color} />
        )}
        {tickets.map((ticket, index) => (
          <div key={ticket.id} className="flex flex-col" style={{ gap: 0 }}>
            <div className="mb-2">
              <TicketCard
                ticket={ticket}
                onDragStart={onTicketDragStart}
                onDragEnd={onTicketDragEnd}
                isDragging={dragState.draggedTicketId === ticket.id}
              />
            </div>
            {isTicketDropTarget && dragState.dropPosition === index + 1 && (
              <DropIndicator color={category.color} />
            )}
          </div>
        ))}
        {tickets.length === 0 && isTicketDropTarget && (
          <div
            className="flex-1 rounded-lg border-2 border-dashed transition-colors"
            style={{ minHeight: 60, borderColor: category.color, opacity: 0.6 }}
          />
        )}
      </div>

      <div className="px-3 pb-3 pt-1">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add task
        </button>
      </div>
    </div>

    {showCreateModal && (
      <CreateTicketModal
        categoryId={category.id}
        onClose={() => setShowCreateModal(false)}
      />
    )}
    </>
  );
}
