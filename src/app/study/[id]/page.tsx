import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { DiagnosticQuestionsClient } from './diagnostic-questions-client';
import { BookOpen, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default async function StudyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch study source
  const { data: studySource, error: studyError } = await supabase
    .from('study_sources')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (studyError || !studySource) {
    redirect('/dashboard');
  }

  // Fetch diagnostic questions
  const { data: questions } = await supabase
    .from('diagnostic_questions')
    .select(`
      *,
      diagnostic_answers (
        user_answer,
        ai_feedback
      )
    `)
    .eq('study_source_id', params.id)
    .order('order_index', { ascending: true });

  // Check if learning plan exists
  const { data: learningPlan } = await supabase
    .from('study_plans')
    .select('*')
    .eq('study_source_id', params.id)
    .single();

  const hasAnsweredAll = questions?.every(
    (q: any) => q.diagnostic_answers && q.diagnostic_answers.length > 0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {studySource.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Deadline: {format(new Date(studySource.deadline_date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Created {format(new Date(studySource.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            {learningPlan && (
              <a
                href={`/study/${params.id}/plan`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                View Learning Plan
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Study Material */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Study Material
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {studySource.raw_text}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Questions & Plan */}
          <div className="lg:col-span-2 space-y-8">
            {/* Diagnostic Questions Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Diagnostic Questions
                </h2>
                {questions && questions.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {questions.filter((q: any) => q.diagnostic_answers?.length > 0).length} / {questions.length} completed
                  </span>
                )}
              </div>

              <DiagnosticQuestionsClient
                studySourceId={params.id}
                questions={questions || []}
              />
            </div>

            {/* Learning Plan Status */}
            {hasAnsweredAll && !learningPlan && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready for Learning Plan
                    </h3>
                    <p className="text-gray-700 mb-4">
                      You've completed all diagnostic questions! Generate your personalized learning plan based on your responses.
                    </p>
                    <a
                      href={`/study/${params.id}/plan`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Generate Learning Plan
                    </a>
                  </div>
                </div>
              </div>
            )}

            {learningPlan && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Learning Plan Ready
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Your personalized learning plan has been generated. View it to see your study schedule and review timeline.
                    </p>
                    <a
                      href={`/study/${params.id}/plan`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      View Learning Plan
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
