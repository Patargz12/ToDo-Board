import { supabase } from '@/src/lib/supabase';
import { Draft } from '@/src/types';

function mapRow(row: Record<string, unknown>): Draft {
  const rawDescription = (row.description as string) ?? '';
  let description = rawDescription;
  let expiryDate = '';
  let priorityLabel = '';
  let priorityColor = '#6b7280';
  let priorityOrder = 0;
  let categoryId = '';

  try {
    const parsed = JSON.parse(rawDescription);
    description = parsed.description ?? '';
    expiryDate = parsed.expiryDate ?? '';
    priorityLabel = parsed.priorityLabel ?? '';
    priorityColor = parsed.priorityColor ?? '#6b7280';
    priorityOrder = parsed.priorityOrder ?? 0;
    categoryId = parsed.categoryId ?? '';
  } catch {}

  return {
    id: row.id as string,
    ticketId: row.ticket_id as string | null,
    title: (row.title as string) ?? '',
    description,
    expiryDate,
    priorityLabel,
    priorityColor,
    priorityOrder,
    categoryId,
    userId: row.user_id as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getDraft(ticketId: string, userId: string): Promise<Draft | null> {
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('ticket_id', ticketId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapRow(data);
}

export async function saveDraft(data: {
  ticketId: string | null;
  title: string;
  description: string;
  expiryDate: string;
  priorityLabel: string;
  priorityColor: string;
  priorityOrder: number;
  categoryId: string;
  userId: string;
  id?: string;
}): Promise<Draft> {
  const payload = {
    ticket_id: data.ticketId,
    title: data.title,
    description: JSON.stringify({
      description: data.description,
      expiryDate: data.expiryDate,
      priorityLabel: data.priorityLabel,
      priorityColor: data.priorityColor,
      priorityOrder: data.priorityOrder,
      categoryId: data.categoryId,
    }),
    user_id: data.userId,
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    const { data: row, error } = await supabase
      .from('drafts')
      .update(payload)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw error;
    return mapRow(row);
  }

  const { data: existing } = await supabase
    .from('drafts')
    .select('id')
    .eq('ticket_id', data.ticketId)
    .eq('user_id', data.userId)
    .maybeSingle();

  if (existing?.id) {
    const { data: row, error } = await supabase
      .from('drafts')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return mapRow(row);
  }

  const { data: row, error } = await supabase
    .from('drafts')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return mapRow(row);
}

export async function deleteDraft(id: string): Promise<void> {
  const { error } = await supabase.from('drafts').delete().eq('id', id);
  if (error) throw error;
}

export async function getTicketIdsWithDrafts(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('drafts')
    .select('ticket_id')
    .eq('user_id', userId)
    .not('ticket_id', 'is', null);

  if (error) throw error;
  return (data ?? []).map((row) => row.ticket_id as string).filter(Boolean);
}
