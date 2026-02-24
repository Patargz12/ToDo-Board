import { supabase } from '@/src/lib/supabase';

export async function createHistoryEntry(
  type: 'board' | 'card',
  action: string,
  details: Record<string, unknown>,
  ticketId: string | null,
  userId: string
) {
  const { error } = await supabase.from('history').insert({
    type,
    action,
    details,
    ticket_id: ticketId,
    user_id: userId,
  });

  if (error) throw error;
}
