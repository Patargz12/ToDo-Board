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
    <div className="flex flex-col h-screen bg-blue-50">
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
        <div className="flex items-center justify-center flex-1">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isMobile ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <MobileTicketView categories={categories} />
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            {showAddForm ? (
              <AddCategoryForm onClose={() => setShowAddForm(false)} />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 transition-all"
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
        <div className="flex-1 overflow-x-auto px-6 py-5">
          <div className="flex gap-4 items-start transition-all duration-200" style={{ minHeight: 'calc(100vh - 120px)' }}>
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
                className="w-80 shrink-0 flex items-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/80 text-gray-600 hover:text-gray-800 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all text-sm font-medium"
                style={{ minHeight: 56 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add column
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
