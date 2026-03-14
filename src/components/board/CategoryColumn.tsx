'use client';

import { useState, useRef } from 'react';
import { Category } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { updateCategory, deleteCategory } from '@/store/slices/boardSlice';
import { TicketCard } from './TicketCard';
import { DropIndicator } from './DropIndicator';
import { CreateTicketModal } from './CreateTicketModal';
import { DragState } from '@/hooks/useDragAndDrop';

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
      className={`w-72 shrink-0 flex flex-col rounded-2xl transition-all duration-200 group min-h-[calc(100vh-130px)] backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)] border ${
        isColumnBeingDragged ? 'opacity-50' : 'opacity-100'
      } ${
        isColumnDragTarget
          ? 'bg-indigo-500/15 border-indigo-500/50'
          : 'bg-white/5 border-white/8'
      }`}
    >
      <div
        className="h-1 w-full rounded-t-2xl shrink-0"
        style={{ backgroundColor: category.color }}
      />

      <div
        draggable={!isEditing}
        onDragStart={(e) => !isEditing && onCategoryDragStart(e, category.id)}
        onDragEnd={() => onCategoryDragEnd()}
        className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing shrink-0 border-b border-white/6"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
          {isEditing ? (
            <input
              ref={inputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 rounded-md px-2 py-0.5 text-sm font-semibold text-slate-100 bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          ) : (
            <span
              onDoubleClick={handleDoubleClick}
              className="flex-1 text-sm font-semibold text-slate-200 truncate select-none"
              title="Double-click to edit, drag to reorder"
            >
              {category.name}
            </span>
          )}
          <span className="text-xs font-semibold rounded-full px-2 py-0.5 shrink-0 bg-white/10 text-slate-400">
            {tickets.length}
          </span>
        </div>

        <div className="relative ml-2">
          {!showDeleteConfirm ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="p-1.5 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100 text-slate-400/60 hover:bg-red-500/15 hover:text-red-400"
              title="Delete column"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
                className="text-xs font-medium px-2 py-1 rounded-md transition-colors bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs font-medium px-2 py-1 rounded-md transition-colors bg-white/10 text-slate-400 border border-white/10 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 px-3 py-3 flex flex-col overflow-y-auto"
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
          <div key={ticket.id} className="flex flex-col">
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
        {tickets.length === 0 && !isTicketDropTarget && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-10 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                style={{ color: category.color }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-500">No tasks yet</p>
          </div>
        )}
        {tickets.length === 0 && isTicketDropTarget && (
          <div
            className="flex-1 rounded-xl border-2 border-dashed opacity-40 min-h-15 transition-colors"
            style={{ borderColor: category.color }}
          />
        )}
      </div>

      <div className="px-3 pb-3 pt-1 shrink-0">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex bg-primary items-center justify-center gap-2 text-xs font-semibold text-primary-foreground   hover:shadow-[0_4px_18px_rgba(251,168,226,0.5)] py-2.5 rounded-xl border border-dashed border-white/10 hover:brightness-105 transition-all duration-150"
        >
         
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
