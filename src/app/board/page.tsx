'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { Navbar } from '@/components/board/Navbar';
import { CategoryColumn } from '@/components/board/CategoryColumn';
import { AddCategoryForm } from '@/components/board/AddCategoryForm';
import { MobileTicketView } from '@/components/board/MobileTicketView';
import { BoardHistoryPanel } from '@/components/board/BoardHistoryPanel';
import { CreateTicketModal } from '@/components/board/CreateTicketModal';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchCategories } from '@/store/slices/boardSlice';
import { fetchTickets } from '@/store/slices/ticketsSlice';
import { fetchDraftedTicketIds } from '@/store/slices/draftsSlice';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useExpiryChecker } from '@/hooks/useExpiryChecker';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { setDaysBefore } from '@/store/slices/notificationSlice';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

function BoardContent() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.board);
  const user = useAppSelector((state) => state.auth.user);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [quickCreateCategoryId, setQuickCreateCategoryId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const {
    dragState,
    handleTicketDragStart,
    handleTicketDragEnd,
    handleCategoryDragStart,
    handleCategoryDragEnd,
    handleTicketDragOver,
    handleColumnDragOver,
    handleDragEnter,
    handleDragLeave,
    handleTicketDrop,
    handleColumnDrop,
  } = useDragAndDrop(categories);

  useExpiryChecker();

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTickets());
    if (user?.id) dispatch(fetchDraftedTicketIds(user.id));
    if (user?.notificationDaysBefore) dispatch(setDaysBefore(user.notificationDaysBefore));
  }, [dispatch, user?.id, user?.notificationDaysBefore]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'n' || e.key === 'N') {
        const firstCategory = categories[0];
        if (firstCategory) setQuickCreateCategoryId(firstCategory.id);
      }
    },
    [categories]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar onOpenHistory={() => setShowHistory(true)} />
      <ToastContainer />

      {showHistory && <BoardHistoryPanel onClose={() => setShowHistory(false)} />}

      {quickCreateCategoryId && (
        <CreateTicketModal
          categoryId={quickCreateCategoryId}
          onClose={() => setQuickCreateCategoryId(null)}
        />
      )}

      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center flex-1 flex-col gap-3">
          <div className="w-9 h-9 border-[3px] border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading board…</p>
        </div>
      ) : isMobile ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <MobileTicketView categories={categories} />
          <div className="px-4 py-3 bg-slate-900/80 border-t border-white/8">
            {showAddForm ? (
              <AddCategoryForm onClose={() => setShowAddForm(false)} />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/8 border border-white/12 hover:border-white/20 rounded-xl transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add column
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto px-6 py-6">
          <div className="flex gap-5 items-start transition-all duration-200 min-h-[calc(100vh-130px)]">
            {categories.map((category) => (
              <CategoryColumn
                key={category.id}
                category={category}
                dragState={dragState}
                onTicketDragStart={handleTicketDragStart}
                onTicketDragEnd={handleTicketDragEnd}
                onCategoryDragStart={handleCategoryDragStart}
                onCategoryDragEnd={handleCategoryDragEnd}
                onTicketDragOver={handleTicketDragOver}
                onColumnDragOver={handleColumnDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onTicketDrop={handleTicketDrop}
                onColumnDrop={handleColumnDrop}
              />
            ))}

            {showAddForm ? (
              <AddCategoryForm onClose={() => setShowAddForm(false)} />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-72 min-h-14 shrink-0 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-white/10 bg-white/4 text-slate-400/70 hover:bg-white/8 hover:border-indigo-500/50 hover:text-indigo-300 transition-all duration-200 text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New column
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <AuthGuard>
      <BoardContent />
    </AuthGuard>
  );
}
