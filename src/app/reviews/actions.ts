'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function markReviewComplete(formData: FormData): Promise<void> {
  try {
    const reviewId = formData.get('reviewId') as string;

    if (!reviewId) {
      throw new Error('Review ID is required');
    }

    const supabase = await createSupabaseServerClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('You must be logged in');
    }

    // Update review as completed
    const { error: updateError } = await (supabase
      .from('reviews') as any)
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to mark review as complete');
    }

    revalidatePath('/reviews');
  } catch (error) {
    console.error('Error marking review complete:', error);
    throw error;
  }
}
