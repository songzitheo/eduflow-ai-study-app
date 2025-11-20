import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { markReviewComplete } from './actions';

export default async function ReviewsPage() {
  const supabase = await createSupabaseServerClient();

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch all study sources for this user
  const { data: studySources } = await (supabase
    .from('study_sources') as any)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const sourceIds = (studySources || []).map((s: any) => s.id);

  // Fetch all reviews for user's study sources
  const { data: reviews } = await (supabase
    .from('reviews') as any)
    .select('*')
    .in('study_source_id', sourceIds)
    .order('scheduled_at', { ascending: true });

  // Create a map of study sources by ID
  const sourcesMap = new Map(
    (studySources || []).map((s: any) => [s.id, s])
  );

  // Group reviews by status
  const now = new Date();
  const upcomingReviews = (reviews || []).filter((r: any) => {
    const scheduledDate = new Date(r.scheduled_at);
    return !r.completed && scheduledDate > now;
  });

  const dueReviews = (reviews || []).filter((r: any) => {
    const scheduledDate = new Date(r.scheduled_at);
    return !r.completed && scheduledDate <= now;
  });

  const completedReviews = (reviews || []).filter((r: any) => r.completed);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Review Schedule</h1>
          <p className="text-gray-600">
            Spaced repetition reviews to reinforce your learning.
          </p>
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-2 text-gray-900">No Reviews Yet</h2>
            <p className="text-gray-600 mb-4">
              Complete a study source with diagnostic questions and a learning plan to create your
              review schedule.
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/study/new">Create Study Source</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Due Reviews */}
            {dueReviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  Due Now ({dueReviews.length})
                </h2>
                <div className="space-y-4">
                  {dueReviews.map((review: any) => {
                    const source = sourcesMap.get(review.study_source_id);
                    return (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        source={source}
                        status="due"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Reviews */}
            {upcomingReviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Upcoming ({upcomingReviews.length})
                </h2>
                <div className="space-y-4">
                  {upcomingReviews.map((review: any) => {
                    const source = sourcesMap.get(review.study_source_id);
                    return (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        source={source}
                        status="upcoming"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Reviews */}
            {completedReviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Completed ({completedReviews.length})
                </h2>
                <div className="space-y-4">
                  {completedReviews.slice(0, 5).map((review: any) => {
                    const source = sourcesMap.get(review.study_source_id);
                    return (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        source={source}
                        status="completed"
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  source,
  status,
}: {
  review: any;
  source: any;
  status: 'due' | 'upcoming' | 'completed';
}) {
  const scheduledDate = new Date(review.scheduled_at);
  const completedDate = review.completed_at ? new Date(review.completed_at) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    if (status === 'due') {
      return (
        <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
          DUE NOW
        </span>
      );
    }
    if (status === 'upcoming') {
      return (
        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
          UPCOMING
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
        COMPLETED
      </span>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusBadge()}
            <h3 className="text-xl font-semibold text-gray-900">{source?.title || 'Unknown Source'}</h3>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p>📅 Scheduled: {formatDate(scheduledDate)}</p>
            {completedDate && <p>✅ Completed: {formatDate(completedDate)}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          {status !== 'completed' && (
            <form action={markReviewComplete}>
              <input type="hidden" name="reviewId" value={review.id} />
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Mark Complete
              </Button>
            </form>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href={`/study/${source?.id}`}>View Study</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
