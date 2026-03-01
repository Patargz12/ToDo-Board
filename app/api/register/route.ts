import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Email, password and username are required.' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: createData.user.id,
        email,
        username,
        avatar_url: null,
        notification_days_before: 1,
      }, { onConflict: 'id' });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(createData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      return NextResponse.json(
        { error: 'Account created. Please sign in.' },
        { status: 200 }
      );
    }

    const user = {
      id: createData.user.id,
      email,
      username,
      avatarUrl: null as string | null,
      notificationDaysBefore: 1,
      createdAt: createData.user.created_at,
    };

    return NextResponse.json({ user, token: signInData.session.access_token }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
