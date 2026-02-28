import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/store/store';
import { getDraft, saveDraft, deleteDraft } from '@/src/lib/api/drafts';
import { markDrafted, unmarkDrafted } from '@/src/store/slices/draftsSlice';
import { Draft } from '@/src/types';

interface DraftPayload {
  title: string;
  description: string;
  expiryDate: string;
  priorityLabel: string;
  priorityColor: string;
  priorityOrder: number;
  categoryId: string;
}

interface UseDraftSaveOptions {
  ticketId: string | null;
  ticketUpdatedAt?: string;
  onDraftLoaded?: (draft: Draft) => void;
}

interface UseDraftSaveResult {
  draftRestored: boolean;
  restoredDraft: Draft | null;
  dismissRestoreNotice: () => void;
  saveCurrentDraft: (payload: DraftPayload) => Promise<void>;
  clearDraft: () => Promise<void>;
}

export function useDraftSave({
  ticketId,
  ticketUpdatedAt,
  onDraftLoaded,
}: UseDraftSaveOptions): UseDraftSaveResult {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [draftRestored, setDraftRestored] = useState(false);
  const [restoredDraft, setRestoredDraft] = useState<Draft | null>(null);
  const initialized = useRef(false);
  const cachedDraftId = useRef<string | null>(null);
  const onDraftLoadedRef = useRef(onDraftLoaded);

  useEffect(() => {
    onDraftLoadedRef.current = onDraftLoaded;
  });

  useEffect(() => {
    if (!ticketId || !user) return;
    if (initialized.current) return;
    initialized.current = true;

    getDraft(ticketId, user.id).then((draft) => {
      if (!draft) return;
      cachedDraftId.current = draft.id;
      if (ticketUpdatedAt && new Date(draft.updatedAt) > new Date(ticketUpdatedAt)) {
        setRestoredDraft(draft);
        setDraftRestored(true);
        onDraftLoadedRef.current?.(draft);
      }
    });
  }, [ticketId, user, ticketUpdatedAt]);

  async function saveCurrentDraft(payload: DraftPayload) {
    if (!user || !ticketId) return;
    try {
      const saved = await saveDraft({
        ticketId,
        userId: user.id,
        id: cachedDraftId.current ?? undefined,
        ...payload,
      });
      cachedDraftId.current = saved.id;
      dispatch(markDrafted(ticketId));
    } catch {}
  }

  async function clearDraft() {
    if (cachedDraftId.current) {
      try {
        await deleteDraft(cachedDraftId.current);
        cachedDraftId.current = null;
        setRestoredDraft(null);
        setDraftRestored(false);
        if (ticketId) dispatch(unmarkDrafted(ticketId));
      } catch {}
    }
  }

  function dismissRestoreNotice() {
    setDraftRestored(false);
  }

  return { draftRestored, restoredDraft, dismissRestoreNotice, saveCurrentDraft, clearDraft };
}
