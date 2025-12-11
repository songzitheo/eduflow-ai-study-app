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

interface ReviewSchedule {
  date: string;
  description: string;
}

interface LearningPlanEmailProps {
  userName?: string;
  studyTitle: string;
  studySourceId: string;
  reviewSchedule: ReviewSchedule[];
}

export function LearningPlanEmail({
  userName = 'Student',
  studyTitle,
  studySourceId,
  reviewSchedule,
}: LearningPlanEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your learning plan for {studyTitle} is ready!</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className="mx-auto my-auto bg-slate-50 px-2 py-10 font-sans">
          <Container className="mx-auto mt-[40px] w-[600px] overflow-hidden rounded-md bg-white shadow-lg">
            <Section className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
              <Heading className="mb-2 text-center text-[32px] font-bold text-white">
                📚 Your Learning Plan is Ready!
              </Heading>
              <Text className="text-center text-white text-lg">
                {studyTitle}
              </Text>
            </Section>

            <Section className="p-8">
              <Text className="text-gray-700 text-[16px] mb-4">
                Hi {userName},
              </Text>
              <Text className="text-gray-700 text-[16px] mb-4">
                Great news! We&apos;ve generated a personalized learning plan based on your diagnostic results.
                Your plan includes a structured study schedule with spaced repetition reviews to maximize retention.
              </Text>

              <Heading as="h2" className="text-[20px] font-bold text-gray-900 mt-6 mb-4">
                📅 Your Review Schedule
              </Heading>
              
              {reviewSchedule.map((review, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 16px',
                    marginBottom: '12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6',
                  }}
                >
                  <Text className="m-0 font-semibold text-gray-900">
                    {format(new Date(review.date), 'EEEE, MMMM d, yyyy')}
                  </Text>
                  <Text className="m-0 text-sm text-gray-600">
                    {review.description}
                  </Text>
                </div>
              ))}

              <Text className="text-gray-600 text-sm mt-6 mb-6">
                💡 <strong>Tip:</strong> We&apos;ll send you email reminders before each review session to help you stay on track!
              </Text>

              <Button
                href={`${baseUrl}/study/${studySourceId}/plan`}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
                style={{ textDecoration: 'none' }}
              >
                View Full Learning Plan
              </Button>
            </Section>

            <Section className="bg-gray-50 p-6 border-t border-gray-200">
              <Text className="text-center text-sm text-gray-600 mb-2">
                Questions or need help? Visit your dashboard.
              </Text>
              <Text className="text-center m-0">
                <Link href={`${baseUrl}/dashboard`} className="text-blue-600 text-sm">
                  Go to Dashboard
                </Link>
              </Text>
            </Section>
          </Container>

          <Container className="mx-auto mt-4">
            <Section className="text-center">
              <Text className="m-0 text-xs text-gray-500">
                Not interested in receiving these emails?
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

export default LearningPlanEmail;
