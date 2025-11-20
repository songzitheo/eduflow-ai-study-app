'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function createStudySource(formData: FormData): Promise<void> {
  try {
    // Extract form data
    const title = formData.get('title') as string;
    const rawText = formData.get('rawText') as string;
    const deadline = formData.get('deadline') as string;

    // Validate required fields
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }

    if (!rawText || rawText.trim() === '') {
      throw new Error('Content is required');
    }

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('You must be logged in to create a study source');
    }

    // Prepare data for insertion
    const insertData: {
      user_id: string;
      title: string;
      raw_text: string;
      deadline_date?: string;
    } = {
      user_id: user.id,
      title: title.trim(),
      raw_text: rawText.trim(),
    };

    // Add deadline if provided
    if (deadline && deadline.trim() !== '') {
      insertData.deadline_date = deadline.trim();
    }

    // Insert into study_sources table
    // Type assertion needed since study_sources table is not yet in the generated types
    const { data, error: insertError } = await (supabase
      .from('study_sources') as any)
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to create study source');
    }

    // Redirect to the created study source or home page
    // Type assertion needed since study_sources table is not yet in the generated types
    redirect(`/study/${(data as any).id}`);
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
}
