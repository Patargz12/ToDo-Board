'use client';

import { useState } from 'react';
import { Category } from '@/types';
import { useAppSelector } from '@/store/store';
import { TicketCard } from './TicketCard';
import { CreateTicketModal } from './CreateTicketModal';

interface MobileTicketViewProps {
  categories: Category[];
}

export function MobileTicketView({ categories }: MobileTicketViewProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id ?? '');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const allTickets = useAppSelector((state) => state.tickets.tickets);

  const tickets = allTickets
    .filter((t) => t.categoryId === activeTab)
    .slice()
    .sort((a, b) => a.position - b.position);

  const countByCategory = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.id] = allTickets.filter((t) => t.categoryId === cat.id).length;
    return acc;
  }, {});

  const activeCategory = categories.find((c) => c.id === activeTab);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 px-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <p className="text-sm text-gray-400 text-center">No columns yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white px-2 pt-1 gap-1 shrink-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
              activeTab === cat.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'
            }`}
            style={{ borderBottomColor: activeTab === cat.id ? cat.color : 'transparent' }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            {cat.name}
            <span className="text-xs text-gray-400 font-normal bg-gray-100 rounded-full px-1.5 py-0.5 ml-0.5">
              {countByCategory[cat.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-400">No tasks yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {activeCategory && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add task
          </button>
        </div>
      )}

      {showCreateModal && activeCategory && (
        <CreateTicketModal
          categoryId={activeCategory.id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

