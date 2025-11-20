import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Calendar, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all study sources for the user
  const { data: studySources } = await supabase
    .from('study_sources')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch progress data for each study source
  const sourcesWithProgress = await Promise.all(
    (studySources || []).map(async (source: any) => {
      // Get question count
      const { count: questionCount } = await supabase
        .from('diagnostic_questions')
        .select('*', { count: 'exact', head: true })
        .eq('study_source_id', source.id);

      // Get answered questions count
      const { data: questions } = await supabase
        .from('diagnostic_questions')
        .select(`
          id,
          diagnostic_answers (
            id
          )
        `)
        .eq('study_source_id', source.id);

      const answeredCount =
        questions?.filter((q: any) => q.diagnostic_answers && q.diagnostic_answers.length > 0)
          .length || 0;

      // Check if learning plan exists
      const { data: learningPlan } = await supabase
        .from('study_plans')
        .select('id')
        .eq('study_source_id', source.id)
        .single();

      // Get review stats
      const { count: totalReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('study_source_id', source.id);

      const { count: completedReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('study_source_id', source.id)
        .eq('completed', true);

      return {
        ...source,
        questionCount: questionCount || 0,
        answeredCount,
        hasLearningPlan: !!learningPlan,
        totalReviews: totalReviews || 0,
        completedReviews: completedReviews || 0,
      };
    })
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Study Sources</h1>
              <p className="text-gray-600">
                Manage your study materials and track your learning progress
              </p>
            </div>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/study/new">
                <Plus className="w-5 h-5 mr-2" />
                New Study Source
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!studySources || studySources.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-2xl mx-auto shadow-sm">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Study Sources Yet</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Get started by creating your first study source. Upload your study materials and let
                AI help you master them.
              </p>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/study/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Study Source
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Study Sources Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sourcesWithProgress.map((source) => {
              const progress =
                source.questionCount > 0
                  ? Math.round((source.answeredCount / source.questionCount) * 100)
                  : 0;
              const daysUntilDeadline = source.deadline_date
                ? Math.ceil(
                    (new Date(source.deadline_date).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <Link
                  key={source.id}
                  href={`/study/${source.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all hover:shadow-lg shadow-sm"
                >
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {source.title}
                  </h3>

                  {/* Progress Bar */}
                  {source.questionCount > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Question Progress</span>
                        <span className="text-blue-600 font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        {source.answeredCount} / {source.questionCount} questions answered
                      </span>
                    </div>

                    {source.deadline_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span
                          className={
                            daysUntilDeadline !== null && daysUntilDeadline < 7
                              ? 'text-orange-600'
                              : 'text-gray-600'
                          }
                        >
                          {daysUntilDeadline !== null && daysUntilDeadline >= 0
                            ? `${daysUntilDeadline} days until deadline`
                            : 'Deadline passed'}
                        </span>
                      </div>
                    )}

                    {source.totalReviews > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          {source.completedReviews} / {source.totalReviews} reviews completed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    {source.hasLearningPlan && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-200 rounded-full text-xs text-green-700">
                        <Clock className="w-3 h-3" />
                        Plan Ready
                      </span>
                    )}
                    {source.questionCount === 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-xs text-blue-700">
                        New
                      </span>
                    )}
                    {progress === 100 && !source.hasLearningPlan && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-xs text-purple-700">
                        Ready for Plan
                      </span>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created {format(new Date(source.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
