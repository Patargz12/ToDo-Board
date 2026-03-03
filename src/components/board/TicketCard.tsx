'use client';

import { useState } from 'react';
import { Ticket } from '@/types';
import { TicketDetailModal } from './TicketDetailModal';
import { useAppSelector } from '@/store/store';
import { getExpiryStatus } from '@/lib/notifications';

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
      className={`rounded-xl px-3 py-2.5 cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging
          ? 'opacity-35 shadow-none'
          : 'opacity-100 shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-lg'
      } ${
        expiry?.status === 'overdue'
          ? 'bg-red-950/35 border border-red-500/35'
          : expiry?.status === 'danger'
          ? 'bg-red-950/40 border border-red-500/25'
          : 'bg-slate-800/85 border border-white/8'
      }`}
      style={{ borderTop: `2px solid ${ticket.priorityColor}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <p className="text-sm font-medium text-slate-200 leading-snug line-clamp-2 flex-1">
          {ticket.title}
        </p>
        {hasDraft && (
          <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Draft
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border"
          style={{
            backgroundColor: ticket.priorityColor + '20',
            color: ticket.priorityColor,
            borderColor: ticket.priorityColor + '30',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: ticket.priorityColor }}
          />
          {ticket.priorityLabel}
        </span>

        {expiry && expiry.status !== 'safe' && (
          <div className="flex items-center gap-1">
            {expiry.status === 'overdue' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold tracking-wide bg-red-500/20 text-red-300 border border-red-500/35">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                OVERDUE
              </span>
            )}
            {expiry.status === 'danger' && (
              <div className="flex items-center gap-1 text-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-medium">{expiry.label}</span>
              </div>
            )}
            {expiry.status === 'warning' && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-400 animate-pulse" />
                <span className="text-xs font-medium text-amber-400">{expiry.label}</span>
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
