import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { generateStudyPlan } from './actions';

export default async function StudyPlanPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createSupabaseServerClient();

  // Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch study source
  const { data: studySource, error: sourceError } = await (supabase
    .from('study_sources') as any)
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (sourceError || !studySource) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Study Source Not Found</h1>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/study/new">Create New Study Source</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fetch study plan
  const { data: studyPlan } = await (supabase
    .from('study_plans') as any)
    .select('*')
    .eq('study_source_id', id)
    .single();

  // If no plan exists, show generate button
  if (!studyPlan) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-24">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-2xl mx-auto shadow-sm">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Generate Your Learning Plan</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Based on your diagnostic answers, we'll create a personalized macro-meso-micro learning plan with spaced repetition reviews.
              </p>
              <form action={generateStudyPlan}>
                <input type="hidden" name="studySourceId" value={id} />
                <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Generate Learning Plan
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Plan exists, render it
  const plan = studyPlan.plan_json;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/study/${id}`}
            className="text-gray-600 hover:text-gray-900 text-sm mb-4 inline-block"
          >
            ← Back to Diagnostic Questions
          </Link>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Learning Plan: {studySource.title}</h1>
          <p className="text-gray-600">
            Your personalized study roadmap based on diagnostic results.
          </p>
        </div>

        {/* Macro → Meso → Micro Display */}
        <div className="space-y-8">
          {plan.macro.map((macro: any) => {
            const mesoSteps = plan.meso.filter((m: any) => m.macroId === macro.id);

            return (
              <div
                key={macro.id}
                className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                {/* Macro Level */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                      MACRO
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900">{macro.title}</h2>
                  </div>
                  <p className="text-gray-600 ml-16">{macro.description}</p>
                </div>

                {/* Meso Level */}
                <div className="ml-8 space-y-6">
                  {mesoSteps.map((meso: any) => {
                    const microSteps = plan.micro.filter(
                      (mi: any) => mi.mesoId === meso.id
                    );

                    return (
                      <div key={meso.id} className="border-l-2 border-gray-300 pl-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                              MESO
                            </span>
                            <h3 className="text-xl font-semibold text-gray-900">{meso.title}</h3>
                          </div>
                          <p className="text-gray-600 text-sm">{meso.description}</p>
                        </div>

                        {/* Micro Level */}
                        <div className="space-y-3">
                          {microSteps.map((micro: any, idx: number) => (
                            <div
                              key={micro.id}
                              className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-200"
                            >
                              <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{micro.title}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {micro.description}
                                </p>
                                <span className="inline-block mt-2 text-xs text-gray-500">
                                  ⏱️ ~{micro.estimatedMinutes} min
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Steps */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xl font-bold mb-2 text-gray-900">What's Next? 📚</h3>
          <p className="text-gray-600 mb-4">
            Your spaced repetition review schedule has been created. Check back at the scheduled
            times to reinforce your learning.
          </p>
          <div className="flex gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/reviews">View Review Schedule</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
