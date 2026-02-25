'use client';

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/src/components/AuthGuard';
import { Navbar } from '@/src/components/board/Navbar';
import { CategoryColumn } from '@/src/components/board/CategoryColumn';
import { AddCategoryForm } from '@/src/components/board/AddCategoryForm';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { fetchCategories } from '@/src/store/slices/boardSlice';
import { fetchTickets } from '@/src/store/slices/ticketsSlice';

function BoardContent() {
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.board);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTickets());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      <Navbar />
      <div className="flex-1 overflow-x-auto px-6 py-5">
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex gap-4 items-start" style={{ minHeight: 'calc(100vh - 120px)' }}>
            {categories.map((category) => (
              <CategoryColumn key={category.id} category={category} />
            ))}

            {showAddForm ? (
              <AddCategoryForm onClose={() => setShowAddForm(false)} />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-80 flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-white/60 hover:bg-white/80 text-gray-600 hover:text-gray-800 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all text-sm font-medium"
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
        )}
      </div>
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
