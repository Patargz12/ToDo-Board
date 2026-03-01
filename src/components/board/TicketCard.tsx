'use client';

import { useState } from 'react';
import { Ticket } from '@/src/types';
import { TicketDetailModal } from './TicketDetailModal';
import { useAppSelector } from '@/src/store/store';
import { getExpiryStatus } from '@/src/lib/notifications';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, ticketId: string, categoryId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export function TicketCard({ ticket, onClick, onDragStart, onDragEnd, isDragging }: TicketCardProps) {
  const daysBefore = useAppSelector((state) => state.notifications.notificationSettings.daysBefore);
  const expiry = ticket.expiryDate ? getExpiryStatus(ticket.expiryDate, daysBefore) : null;
  const [showModal, setShowModal] = useState(false);
  const [dragStarted, setDragStarted] = useState(false);
  const hasDraft = useAppSelector((state) =>
    state.drafts.draftedTicketIds.includes(ticket.id)
  );

  function handleClick() {
    if (dragStarted) return;
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  }

  return (
    <>
    <div
      data-ticket-id={ticket.id}
      draggable={true}
      onClick={handleClick}
      onDragStart={(e) => {
        setDragStarted(true);
        onDragStart?.(e, ticket.id, ticket.categoryId);
      }}
      onDragEnd={() => {
        setTimeout(() => setDragStarted(false), 0);
        onDragEnd?.();
      }}
      className={`rounded-lg px-3 py-2.5 shadow-sm border cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 group select-none ${
        expiry?.status === 'overdue'
          ? 'bg-red-50 border-red-200'
          : expiry?.status === 'danger'
          ? 'bg-white border-red-300'
          : 'bg-white border-gray-100'
      }`}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: ticket.priorityColor,
        borderLeftStyle: 'solid',
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2 flex-1">
          {ticket.title}
        </p>
        {hasDraft && (
          <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 border border-amber-200">
            Draft
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: ticket.priorityColor + '22', color: ticket.priorityColor }}
        >
          {ticket.priorityLabel}
        </span>

        {expiry && expiry.status !== 'safe' && (
          <div className="flex items-center gap-1">
            {expiry.status === 'overdue' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-300 tracking-wide">
                OVERDUE
              </span>
            )}
            {expiry.status === 'danger' && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-medium text-red-600">{expiry.label}</span>
              </div>
            )}
            {expiry.status === 'warning' && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-400 animate-pulse" />
                <span className="text-xs font-medium text-amber-600">{expiry.label}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {showModal && (
      <TicketDetailModal ticket={ticket} onClose={() => setShowModal(false)} />
    )}
    </>
  );
}
