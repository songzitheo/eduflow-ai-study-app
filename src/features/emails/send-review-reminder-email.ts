'use server';

import { render } from '@react-email/components';

import { resendClient } from '@/libs/resend/resend-client';

import { ReviewReminderEmail } from './review-reminder-email';

interface SendReviewReminderEmailProps {
  userEmail: string;
  userName?: string;
  studyTitle: string;
  studySourceId: string;
  reviewDate: string;
  reviewNumber: number;
}

export async function sendReviewReminderEmail({
  userEmail,
  userName,
  studyTitle,
  studySourceId,
  reviewDate,
  reviewNumber,
}: SendReviewReminderEmailProps) {
  // Skip if Resend is not configured
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping email');
    return { success: false, message: 'Resend not configured' };
  }

  try {
    const emailHtml = await render(
      ReviewReminderEmail({
        userName,
        studyTitle,
        studySourceId,
        reviewDate,
        reviewNumber,
      })
    );

    const { data, error } = await resendClient.emails.send({
      from: 'EduFlow <onboarding@resend.dev>', // Replace with your verified domain
      to: [userEmail],
      subject: `🔔 Review Reminder: ${studyTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Review reminder email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending review reminder email:', error);
    throw error;
  }
}
