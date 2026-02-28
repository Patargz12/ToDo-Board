'use client';

import { useEffect, useRef, useState } from 'react';
import { Ticket } from '@/src/types';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { updateTicket, deleteTicket, moveTicket, removeTicketFromState } from '@/src/store/slices/ticketsSlice';
import { fetchCardHistory } from '@/src/store/slices/historySlice';
import { useDraftSave } from '@/src/hooks/useDraftSave';
import { PrioritySelector } from './PrioritySelector';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return then.toLocaleDateString();
}

function formatActionLabel(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export function TicketDetailModal({ ticket, onClose }: Props) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.board.categories);
  const cardHistory = useAppSelector((state) => state.history.cardHistory[ticket.id] ?? []);
  const allTickets = useAppSelector((state) => state.tickets.tickets);

  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [expiryDate, setExpiryDate] = useState(ticket.expiryDate ? ticket.expiryDate.slice(0, 16) : '');
  const [priorityLabel, setPriorityLabel] = useState(ticket.priorityLabel);
  const [priorityColor, setPriorityColor] = useState(ticket.priorityColor);
  const [priorityOrder, setPriorityOrder] = useState(ticket.priorityOrder);
  const [categoryId, setCategoryId] = useState(ticket.categoryId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [draftApplied, setDraftApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const draftAppliedRef = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const { draftRestored, dismissRestoreNotice, saveCurrentDraft, clearDraft } = useDraftSave({
    ticketId: ticket.id,
    ticketUpdatedAt: ticket.updatedAt,
    onDraftLoaded: (draft) => {
      if (draftAppliedRef.current) return;
      draftAppliedRef.current = true;
      setTitle(draft.title || ticket.title);
      setDescription(draft.description);
      setExpiryDate(draft.expiryDate || (ticket.expiryDate ? ticket.expiryDate.slice(0, 16) : ''));
      if (draft.priorityLabel) setPriorityLabel(draft.priorityLabel);
      if (draft.priorityColor) setPriorityColor(draft.priorityColor);
      if (draft.priorityOrder !== undefined) setPriorityOrder(draft.priorityOrder);
      if (draft.categoryId) setCategoryId(draft.categoryId);
      setDraftApplied(true);
    },
  });

  const isDirty =
    title !== ticket.title ||
    description !== ticket.description ||
    expiryDate !== (ticket.expiryDate ? ticket.expiryDate.slice(0, 16) : '') ||
    priorityLabel !== ticket.priorityLabel ||
    priorityColor !== ticket.priorityColor ||
    priorityOrder !== ticket.priorityOrder ||
    categoryId !== ticket.categoryId;

  useEffect(() => {
    dispatch(fetchCardHistory(ticket.id));
  }, [dispatch, ticket.id]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  async function handleSave() {
    const trimmedTitle = title.trim() || ticket.title;
    setSaving(true);
    try {
      await dispatch(updateTicket({
        id: ticket.id,
        title: trimmedTitle,
        description,
        expiryDate,
        priorityLabel,
        priorityColor,
        priorityOrder,
      })).unwrap();

      if (categoryId !== ticket.categoryId) {
        const targetPosition = allTickets.filter((t) => t.categoryId === categoryId).length;
        await dispatch(moveTicket({ ticketId: ticket.id, targetCategoryId: categoryId, targetPosition })).unwrap();
      }

      await clearDraft();
      onClose();
    } catch {
      setSaving(false);
    }
  }

  async function handleClose() {
    if (isDirty) {
      await saveCurrentDraft({
        title: title.trim() || ticket.title,
        description,
        expiryDate,
        priorityLabel,
        priorityColor,
        priorityOrder,
        categoryId,
      });
    }
    onClose();
  }

  async function handleDelete() {
    dispatch(removeTicketFromState(ticket.id));
    onClose();
    await clearDraft().catch(() => {});
    dispatch(deleteTicket(ticket.id));
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) handleClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[60vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex-1 pr-4">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') setEditingTitle(false);
                }}
                className="w-full text-lg font-semibold text-gray-900 border-b-2 border-blue-500 outline-none bg-transparent pb-0.5"
              />
            ) : (
              <h2
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setEditingTitle(true)}
                title="Click to edit title"
              >
                {title}
              </h2>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History
            {cardHistory.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {cardHistory.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="px-6 py-4 space-y-5">
              {draftRestored && draftApplied && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-amber-700 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Draft restored — review your changes before saving
                  </div>
                  <button onClick={dismissRestoreNotice} className="text-amber-500 hover:text-amber-700 text-xs">
                    Dismiss
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Description
                  </label>
                  {isDirty && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-xs text-gray-400">Unsaved changes</span>
                    </div>
                  )}
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Add a description..."
                  className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Priority
                </label>
                <PrioritySelector
                  value={{ label: priorityLabel, color: priorityColor, order: priorityOrder }}
                  onChange={(p) => {
                    setPriorityLabel(p.label);
                    setPriorityColor(p.color);
                    setPriorityOrder(p.order);
                  }}
                />
              </div>


            </div>
          )}

          {activeTab === 'history' && (
            <div className="px-6 py-4">
              {cardHistory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No history yet</p>
              ) : (
                <div className="space-y-3">
                  {cardHistory.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {formatActionLabel(entry.action)}
                          </span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {timeAgo(entry.createdAt)}
                          </span>
                        </div>
                        {entry.details && Object.keys(entry.details).length > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {(entry.details.message as string) ??
                              (entry.details.title as string) ??
                              JSON.stringify(entry.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-1.5">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Delete this ticket?</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              {isDirty ? 'Save as draft' : 'Close'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
            >
              {saving && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
