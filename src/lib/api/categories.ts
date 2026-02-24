import { supabase } from '@/src/lib/supabase';
import { Category } from '@/src/types';

export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    userId: row.user_id,
    createdAt: row.created_at,
  }));
}

export async function createCategory(data: {
  name: string;
  color: string;
  position: number;
  userId: string;
}): Promise<Category> {
  const { data: row, error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      color: data.color,
      position: data.position,
      user_id: data.userId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export async function updateCategory(
  id: string,
  data: { name?: string; color?: string }
): Promise<Category> {
  const { data: row, error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function batchUpdateCategoryPositions(
  categories: { id: string; position: number }[]
): Promise<void> {
  await Promise.all(
    categories.map(({ id, position }) =>
      supabase.from('categories').update({ position }).eq('id', id)
    )
  );
}
