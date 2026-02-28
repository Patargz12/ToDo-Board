'use client';

import { useState } from 'react';
import { Ticket } from '@/src/types';
import { TicketDetailModal } from './TicketDetailModal';
import { useAppSelector } from '@/src/store/store';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, ticketId: string, categoryId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

function getExpiryInfo(expiryDate: string): { label: string; colorClass: string; dotColor: string } {
  if (!expiryDate) return { label: '', colorClass: '', dotColor: '' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: 'Overdue', colorClass: 'text-red-600', dotColor: 'bg-red-500' };
  }
  if (diffDays === 0) {
    return { label: 'Due today', colorClass: 'text-red-500', dotColor: 'bg-red-400' };
  }
  if (diffDays === 1) {
    return { label: '1 day left', colorClass: 'text-yellow-600', dotColor: 'bg-yellow-400' };
  }
  if (diffDays <= 3) {
    return { label: `${diffDays} days left`, colorClass: 'text-yellow-600', dotColor: 'bg-yellow-400' };
  }
  return { label: `${diffDays} days left`, colorClass: 'text-green-600', dotColor: 'bg-green-500' };
}

export function TicketCard({ ticket, onClick, onDragStart, onDragEnd, isDragging }: TicketCardProps) {
  const expiry = ticket.expiryDate ? getExpiryInfo(ticket.expiryDate) : null;
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
      className="bg-white rounded-lg px-3 py-2.5 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 group select-none"
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

        {expiry && (
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${expiry.dotColor}`} />
            <span className={`text-xs font-medium ${expiry.colorClass}`}>{expiry.label}</span>
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
