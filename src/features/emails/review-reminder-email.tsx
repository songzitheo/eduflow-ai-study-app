import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { format } from 'date-fns';

import tailwindConfig from './tailwind.config';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface ReviewReminderEmailProps {
  userName?: string;
  studyTitle: string;
  studySourceId: string;
  reviewDate: string;
  reviewNumber: number;
}

export function ReviewReminderEmail({
  userName = 'Student',
  studyTitle,
  studySourceId,
  reviewDate,
  reviewNumber,
}: ReviewReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Time to review: {studyTitle}</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="mx-auto my-auto bg-slate-50 px-2 py-10 font-sans">
          <Container className="mx-auto mt-[40px] w-[600px] overflow-hidden rounded-md bg-white shadow-lg">
            <Section className="bg-gradient-to-r from-green-600 to-teal-600 p-8">
              <Heading className="mb-2 text-center text-[32px] font-bold text-white">
                🔔 Review Reminder
              </Heading>
              <Text className="text-center text-white text-lg">
                It&apos;s time for Review #{reviewNumber}
              </Text>
            </Section>

            <Section className="p-8">
              <Text className="text-gray-700 text-[16px] mb-4">
                Hi {userName},
              </Text>
              <Text className="text-gray-700 text-[16px] mb-4">
                This is a friendly reminder that your scheduled review session for{' '}
                <strong>&quot;{studyTitle}&quot;</strong> is today!
              </Text>

              <div
                style={{
                  padding: '16px',
                  marginBottom: '24px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '8px',
                  border: '2px solid #86efac',
                }}
              >
                <Text className="m-0 mb-2 font-semibold text-gray-900 text-lg">
                  📅 Scheduled for: {format(new Date(reviewDate), 'EEEE, MMMM d, yyyy')}
                </Text>
                <Text className="m-0 text-gray-700">
                  Spaced repetition helps you retain information longer. Take 10-15 minutes today to review your learning plan.
                </Text>
              </div>

              <Text className="text-gray-700 text-[16px] mb-6">
                <strong>Why review matters:</strong>
                <br />
                • Reinforces memory and understanding
                <br />
                • Identifies areas that need more practice
                <br />
                • Builds long-term retention
                <br />
                • Keeps you on track with your learning goals
              </Text>

              <Button
                href={`${baseUrl}/reviews`}
                className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
                style={{ textDecoration: 'none' }}
              >
                Start Review Session
              </Button>

              <Text className="text-gray-600 text-sm mt-6 mb-0">
                💡 <strong>Tip:</strong> Even a quick 10-minute review can make a big difference in retention!
              </Text>
            </Section>

            <Section className="bg-gray-50 p-6 border-t border-gray-200">
              <Text className="text-center text-sm text-gray-600 mb-2">
                View your full learning plan anytime
              </Text>
              <Text className="text-center m-0">
                <Link href={`${baseUrl}/study/${studySourceId}/plan`} className="text-blue-600 text-sm">
                  View Learning Plan
                </Link>
                {' · '}
                <Link href={`${baseUrl}/dashboard`} className="text-blue-600 text-sm">
                  Dashboard
                </Link>
              </Text>
            </Section>
          </Container>

          <Container className="mx-auto mt-4">
            <Section className="text-center">
              <Text className="m-0 text-xs text-gray-500">
                Not interested in receiving these reminders?
              </Text>
              <Link className="text-center text-xs text-gray-500 underline" href={`${baseUrl}/account`}>
                Update your notification settings
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ReviewReminderEmail;
