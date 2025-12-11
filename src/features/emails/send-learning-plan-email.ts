'use server';

import { render } from '@react-email/components';

import { resendClient } from '@/libs/resend/resend-client';

import { LearningPlanEmail } from './learning-plan-email';

interface ReviewSchedule {
  date: string;
  description: string;
}

interface SendLearningPlanEmailProps {
  userEmail: string;
  userName?: string;
  studyTitle: string;
  studySourceId: string;
  reviewSchedule: ReviewSchedule[];
}

export async function sendLearningPlanEmail({
  userEmail,
  userName,
  studyTitle,
  studySourceId,
  reviewSchedule,
}: SendLearningPlanEmailProps) {
  // Skip if Resend is not configured
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend not configured, skipping email');
    return { success: false, message: 'Resend not configured' };
  }

  try {
    const emailHtml = await render(
      LearningPlanEmail({
        userName,
        studyTitle,
        studySourceId,
        reviewSchedule,
      })
    );

    const { data, error } = await resendClient.emails.send({
      from: 'EduFlow <onboarding@resend.dev>', // Replace with your verified domain
      to: [userEmail],
      subject: `📚 Your Learning Plan for "${studyTitle}" is Ready!`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Learning plan email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending learning plan email:', error);
    throw error;
  }
}
