'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { fetchBoardHistory, loadMoreBoardHistory } from '@/src/store/slices/historySlice';
import { HistoryEntry } from '@/src/types';

interface BoardHistoryPanelProps {
  onClose: () => void;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateGroup(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDate(entries: HistoryEntry[]) {
  const groups: Record<string, HistoryEntry[]> = {};
  for (const entry of entries) {
    const key = new Date(entry.createdAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

function actionLabel(entry: HistoryEntry) {
  switch (entry.action) {
    case 'category_created':
      return `Created column "${entry.details.name}"`;
    case 'category_deleted':
      return `Deleted column "${entry.details.name}"`;
    case 'category_renamed':
      return `Renamed "${entry.details.oldName}" → "${entry.details.newName}"`;
    case 'category_reordered':
      return 'Reordered columns';
    case 'ticket_moved':
      return `Moved "${entry.details.title}" from "${entry.details.from}" → "${entry.details.to}"`;
    case 'ticket_created':
      return `Added task "${entry.details.title}"`;
    case 'ticket_deleted':
      return `Deleted task "${entry.details.title}"`;
    default:
      return entry.action.replace(/_/g, ' ');
  }
}

export function BoardHistoryPanel({ onClose }: BoardHistoryPanelProps) {
  const dispatch = useAppDispatch();
  const { boardHistory, loading, hasMore } = useAppSelector((state) => state.history);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchBoardHistory());
  }, [dispatch]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 60) {
      dispatch(loadMoreBoardHistory(boardHistory.length));
    }
  }, [dispatch, loading, hasMore, boardHistory.length]);

  const grouped = groupByDate(boardHistory);
  const dateKeys = Object.keys(grouped);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slide-in-right"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Board History</h2>
            <p className="text-xs text-gray-400 mt-0.5">All activity on this board</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-3"
        >
          {loading && boardHistory.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : boardHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm text-gray-400">No history yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {dateKeys.map((dateKey) => (
                <div key={dateKey}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {formatDateGroup(grouped[dateKey][0].createdAt)}
                  </p>
                  <div className="flex flex-col gap-1">
                    {grouped[dateKey].map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 leading-snug">{actionLabel(entry)}</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 pt-0.5">
                          {formatTime(entry.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!hasMore && boardHistory.length > 0 && (
                <p className="text-xs text-center text-gray-300 py-2">No more history</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
