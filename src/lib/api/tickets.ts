import { supabase } from '@/src/lib/supabase';
import { Ticket } from '@/src/types';

function mapRow(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    expiryDate: (row.expiry_date as string) ?? '',
    priorityLabel: (row.priority_label as string) ?? '',
    priorityColor: (row.priority_color as string) ?? '#6b7280',
    priorityOrder: (row.priority_order as number) ?? 0,
    categoryId: row.category_id as string,
    userId: row.user_id as string,
    position: row.position as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data.map(mapRow);
}

export async function createTicket(data: {
  title: string;
  description: string;
  expiryDate: string;
  priorityLabel: string;
  priorityColor: string;
  priorityOrder: number;
  categoryId: string;
  userId: string;
  position: number;
}): Promise<Ticket> {
  const { data: row, error } = await supabase
    .from('tickets')
    .insert({
      title: data.title,
      description: data.description,
      expiry_date: data.expiryDate || null,
      priority_label: data.priorityLabel,
      priority_color: data.priorityColor,
      priority_order: data.priorityOrder,
      category_id: data.categoryId,
      user_id: data.userId,
      position: data.position,
    })
    .select()
    .single();

  if (error) throw error;
  return mapRow(row);
}

export async function updateTicket(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    expiryDate: string;
    priorityLabel: string;
    priorityColor: string;
    priorityOrder: number;
    categoryId: string;
    position: number;
  }>
): Promise<Ticket> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.expiryDate !== undefined) payload.expiry_date = data.expiryDate || null;
  if (data.priorityLabel !== undefined) payload.priority_label = data.priorityLabel;
  if (data.priorityColor !== undefined) payload.priority_color = data.priorityColor;
  if (data.priorityOrder !== undefined) payload.priority_order = data.priorityOrder;
  if (data.categoryId !== undefined) payload.category_id = data.categoryId;
  if (data.position !== undefined) payload.position = data.position;

  const { data: row, error } = await supabase
    .from('tickets')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapRow(row);
}

export async function deleteTicket(id: string): Promise<void> {
  const { error } = await supabase.from('tickets').delete().eq('id', id);
  if (error) throw error;
}

export async function batchUpdateTicketPositions(
  tickets: { id: string; position: number }[]
): Promise<void> {
  const updates = tickets.map(({ id, position }) =>
    supabase.from('tickets').update({ position }).eq('id', id)
  );
  await Promise.all(updates);
}
