'use client';

import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/src/store/store';
import { moveTicket } from '@/src/store/slices/ticketsSlice';
import { reorderCategories } from '@/src/store/slices/boardSlice';
import { Category } from '@/src/types';

export interface DragState {
  draggedTicketId: string | null;
  draggedCategoryId: string | null;
  dragType: 'ticket' | 'category' | null;
  dropTargetCategoryId: string | null;
  dropPosition: number;
  isDragging: boolean;
  highlightedCategoryId: string | null;
}

const initialDragState: DragState = {
  draggedTicketId: null,
  draggedCategoryId: null,
  dragType: null,
  dropTargetCategoryId: null,
  dropPosition: -1,
  isDragging: false,
  highlightedCategoryId: null,
};

export function useDragAndDrop(categories: Category[]) {
  const dispatch = useAppDispatch();
  const [dragState, setDragState] = useState<DragState>(initialDragState);

  const handleTicketDragStart = useCallback(
    (e: React.DragEvent, ticketId: string, sourceCategoryId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('dragType', 'ticket');
      e.dataTransfer.setData('ticketId', ticketId);
      e.dataTransfer.setData('sourceCategoryId', sourceCategoryId);
      setDragState((prev) => ({
        ...prev,
        draggedTicketId: ticketId,
        dragType: 'ticket',
        isDragging: true,
      }));
    },
    []
  );

  const handleTicketDragEnd = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  const handleCategoryDragStart = useCallback(
    (e: React.DragEvent, categoryId: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('dragType', 'category');
      e.dataTransfer.setData('categoryId', categoryId);
      setDragState((prev) => ({
        ...prev,
        draggedCategoryId: categoryId,
        dragType: 'category',
        isDragging: true,
      }));
    },
    []
  );

  const handleCategoryDragEnd = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  const handleTicketDragOver = useCallback(
    (e: React.DragEvent, categoryId: string, ticketsInCategory: { id: string }[]) => {
      const dragType = e.dataTransfer.types.includes('dragtype')
        ? e.dataTransfer.getData('dragType')
        : null;

      if (dragType === 'category') return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const container = e.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      const y = e.clientY - rect.top;

      const ticketElements = Array.from(
        container.querySelectorAll('[data-ticket-id]')
      ) as HTMLElement[];

      let position = ticketsInCategory.length;

      for (let i = 0; i < ticketElements.length; i++) {
        const el = ticketElements[i];
        const elRect = el.getBoundingClientRect();
        const mid = elRect.top + elRect.height / 2 - rect.top;
        if (y < mid) {
          position = i;
          break;
        }
      }

      setDragState((prev) => {
        if (
          prev.dropTargetCategoryId === categoryId &&
          prev.dropPosition === position
        ) {
          return prev;
        }
        return {
          ...prev,
          dropTargetCategoryId: categoryId,
          dropPosition: position,
          highlightedCategoryId: categoryId,
        };
      });
    },
    []
  );

  const handleColumnDragOver = useCallback((e: React.DragEvent, categoryId: string) => {
    const dragType = e.dataTransfer.types.includes('dragtype')
      ? e.dataTransfer.getData('dragType')
      : null;

    if (dragType === 'ticket') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    setDragState((prev) => ({
      ...prev,
      dropTargetCategoryId: categoryId,
      highlightedCategoryId: categoryId,
    }));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragState((prev) => ({
      ...prev,
      highlightedCategoryId: categoryId,
    }));
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent, categoryId: string) => {
      const related = e.relatedTarget as Node | null;
      const current = e.currentTarget as HTMLElement;
      if (related && current.contains(related)) return;

      setDragState((prev) => {
        if (prev.highlightedCategoryId !== categoryId) return prev;
        return { ...prev, highlightedCategoryId: null, dropTargetCategoryId: null, dropPosition: -1 };
      });
    },
    []
  );

  const handleTicketDrop = useCallback(
    (
      e: React.DragEvent,
      targetCategoryId: string,
      ticketsInCategory: { id: string; categoryId: string }[]
    ) => {
      e.preventDefault();
      const dragType = e.dataTransfer.getData('dragType');
      if (dragType !== 'ticket') return;

      const ticketId = e.dataTransfer.getData('ticketId');
      if (!ticketId) return;

      const container = e.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      const y = e.clientY - rect.top;

      const ticketElements = Array.from(
        container.querySelectorAll('[data-ticket-id]')
      ) as HTMLElement[];

      let position = ticketsInCategory.filter((t) => t.id !== ticketId).length;

      for (let i = 0; i < ticketElements.length; i++) {
        const el = ticketElements[i];
        if (el.getAttribute('data-ticket-id') === ticketId) continue;
        const elRect = el.getBoundingClientRect();
        const mid = elRect.top + elRect.height / 2 - rect.top;
        if (y < mid) {
          position = i;
          break;
        }
      }

      dispatch(moveTicket({ ticketId, targetCategoryId, targetPosition: position }));
      setDragState(initialDragState);
    },
    [dispatch]
  );

  const handleColumnDrop = useCallback(
    (e: React.DragEvent, targetCategoryId: string) => {
      e.preventDefault();
      const dragType = e.dataTransfer.getData('dragType');
      if (dragType !== 'category') return;

      const draggedId = e.dataTransfer.getData('categoryId');
      if (!draggedId || draggedId === targetCategoryId) {
        setDragState(initialDragState);
        return;
      }

      const sorted = [...categories].sort((a, b) => a.position - b.position);
      const fromIndex = sorted.findIndex((c) => c.id === draggedId);
      const toIndex = sorted.findIndex((c) => c.id === targetCategoryId);

      if (fromIndex === -1 || toIndex === -1) {
        setDragState(initialDragState);
        return;
      }

      const reordered = [...sorted];
      const [removed] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, removed);

      const withPositions = reordered.map((c, i) => ({ ...c, position: i }));
      dispatch(reorderCategories(withPositions));
      setDragState(initialDragState);
    },
    [dispatch, categories]
  );

  return {
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
  };
}
