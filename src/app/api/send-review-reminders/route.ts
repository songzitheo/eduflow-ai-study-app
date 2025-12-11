import { NextRequest, NextResponse } from 'next/server';

import { sendReviewReminderEmail } from '@/features/emails/send-review-reminder-email';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

// This endpoint should be called by a cron job (e.g., Vercel Cron or external service)
// to send review reminder emails
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // Get reviews scheduled for today that haven't been completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: reviews, error } = await (supabase
      .from('reviews') as any)
      .select(`
        *,
        study_sources (
          id,
          title,
          user_id,
          users (
            email
          )
        )
      `)
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())
      .eq('completed', false)
      .eq('reminder_sent', false);

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ message: 'No reviews scheduled for today', sent: 0 });
    }

    // Send reminder emails
    const results = await Promise.allSettled(
      reviews.map(async (review: any, index: number) => {
        try {
          const studySource = review.study_sources;
          const userEmail = studySource?.users?.email;

          if (!userEmail) {
            console.error(`No email found for review ${review.id}`);
            return { success: false, reviewId: review.id, error: 'No email found' };
          }

          await sendReviewReminderEmail({
            userEmail,
            userName: userEmail.split('@')[0],
            studyTitle: studySource.title,
            studySourceId: studySource.id,
            reviewDate: review.scheduled_at,
            reviewNumber: index + 1,
          });

          // Mark reminder as sent
          await (supabase
            .from('reviews') as any)
            .update({ reminder_sent: true })
            .eq('id', review.id);

          return { success: true, reviewId: review.id };
        } catch (err: any) {
          console.error(`Failed to send reminder for review ${review.id}:`, err);
          return { success: false, reviewId: review.id, error: err.message };
        }
      })
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.filter((r) => r.status === 'rejected' || !(r.value as any).success).length;

    return NextResponse.json({
      message: 'Review reminders processed',
      sent,
      failed,
      total: reviews.length,
    });
  } catch (error: any) {
    console.error('Error in send-review-reminders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
