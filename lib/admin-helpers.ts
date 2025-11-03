import { createClient } from '@/lib/supabase/server';

export async function isUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single();

  return profile?.is_admin || false;
}

export async function requireAdmin() {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return true;
}
