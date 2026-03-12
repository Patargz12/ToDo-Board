'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Ticket } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { updateTicket, deleteTicket, moveTicket } from '@/store/slices/ticketsSlice';
import { fetchCardHistory } from '@/store/slices/historySlice';
import { useDraftSave } from '@/hooks/useDraftSave';
import { PrioritySelector } from './PrioritySelector';
import { Button } from '@/components/ui/Button';

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
    onClose();
    await clearDraft().catch(() => {});
    dispatch(deleteTicket(ticket));
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) handleClose();
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl h-[85vh] sm:h-auto sm:max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/[0.07] shrink-0">
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
                className="w-full text-lg font-semibold text-slate-100 border-b-2 border-indigo-500 outline-none bg-transparent pb-0.5"
              />
            ) : (
              <h2
                className="text-lg font-semibold text-slate-100 cursor-pointer hover:text-indigo-300 transition-colors"
                onClick={() => setEditingTitle(true)}
                title="Click to edit title"
              >
                {title}
              </h2>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white/8 hover:text-slate-200 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-white/[0.07] shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            History
            {cardHistory.length > 0 && (
              <span className="ml-1.5 text-xs bg-white/8 text-slate-400 px-1.5 py-0.5 rounded-full">
                {cardHistory.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="px-6 py-5 flex flex-col gap-5">
              {draftRestored && draftApplied && (
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 text-amber-300 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Draft restored — review your changes before saving
                  </div>
                  <button onClick={dismissRestoreNotice} className="text-amber-400 hover:text-amber-200 text-xs shrink-0 ml-3">
                    Dismiss
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </label>
                  {isDirty && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-xs text-slate-500">Unsaved changes</span>
                    </div>
                  )}
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Add a description…"
                  className="w-full text-sm text-slate-200 placeholder:text-slate-500 bg-white/6 border border-white/10 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-sm text-slate-200 bg-white/6 border border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 scheme-dark transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-sm text-slate-200 bg-white/6 border border-white/10 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 scheme-dark transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-800 text-slate-200">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
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
            <div className="px-6 py-5">
              {cardHistory.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10">No history yet</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {cardHistory.map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-medium text-slate-300">
                            {formatActionLabel(entry.action)}
                          </span>
                          <span className="text-xs text-slate-500 shrink-0">
                            {timeAgo(entry.createdAt)}
                          </span>
                        </div>
                        {entry.details && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {entry.details}
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

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.07] shrink-0">
          <div className="flex items-center gap-2">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-slate-400">Delete this ticket?</span>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
            >
              {isDirty ? 'Save as draft' : 'Close'}
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !isDirty}
              loading={saving}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
