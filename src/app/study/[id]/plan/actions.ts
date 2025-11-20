'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { openaiClient } from '@/features/study/lib/openai-client';

export async function generateStudyPlan(formData: FormData): Promise<void> {
  try {
    const studySourceId = formData.get('studySourceId') as string;
    
    if (!studySourceId) {
      throw new Error('Study source ID is required');
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

    // Check if plan already exists
    const { data: existingPlan } = await (supabase
      .from('study_plans') as any)
      .select('id')
      .eq('study_source_id', studySourceId)
      .limit(1);

    if (existingPlan && existingPlan.length > 0) {
      // Plan already exists
      return;
    }

    // Fetch study source
    const { data: studySource, error: sourceError } = await (supabase
      .from('study_sources') as any)
      .select('*')
      .eq('id', studySourceId)
      .single();

    if (sourceError || !studySource) {
      throw new Error('Study source not found');
    }

    // Fetch diagnostic questions and answers
    const { data: questions } = await (supabase
      .from('diagnostic_questions') as any)
      .select('*')
      .eq('study_source_id', studySourceId);

    const questionIds = (questions || []).map((q: any) => q.id);
    
    const { data: answers } = await (supabase
      .from('diagnostic_answers') as any)
      .select('*')
      .in('question_id', questionIds);

    // Build context for AI
    const diagnosticContext = (questions || [])
      .map((q: any, i: number) => {
        const answer = (answers || []).find((a: any) => a.question_id === q.id);
        return `Q${i + 1}: ${q.question}\nA${i + 1}: ${answer?.user_answer || 'No answer'}\nFeedback: ${answer?.ai_feedback || 'N/A'}`;
      })
      .join('\n\n');

    // Generate study plan using OpenAI
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert learning designer. Create a comprehensive, scaffolded learning plan using the Macro → Meso → Micro framework.

MACRO level: 3-5 high-level learning objectives or knowledge domains
MESO level: For each macro objective, define 2-4 intermediate skills/concepts
MICRO level: For each meso step, break down into 3-6 specific, actionable learning tasks (5-20 min each)

Return ONLY valid JSON with this exact structure:
{
  "macro": [
    {"id": "m1", "title": "...", "description": "...", "order": 0}
  ],
  "meso": [
    {"id": "me1", "macroId": "m1", "title": "...", "description": "...", "order": 0}
  ],
  "micro": [
    {"id": "mi1", "mesoId": "me1", "title": "...", "description": "...", "estimatedMinutes": 10, "order": 0}
  ]
}`,
        },
        {
          role: 'user',
          content: `Study Material: "${studySource.title}"\n\nContent:\n${studySource.raw_text}\n\nDiagnostic Results:\n${diagnosticContext}\n\nCreate a personalized learning plan:`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    const planJson = JSON.parse(responseText.trim());

    // Insert plan into database
    const { error: insertError } = await (supabase
      .from('study_plans') as any)
      .insert({
        study_source_id: studySourceId,
        plan_json: planJson,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save study plan');
    }

    // Create initial review schedule (J+2, J+7, J+21 days from now)
    const now = new Date();
    const reviews = [
      { days: 2, label: 'J+2' },
      { days: 7, label: 'J+7' },
      { days: 21, label: 'J+21' },
    ].map(({ days }) => {
      const scheduledDate = new Date(now);
      scheduledDate.setDate(scheduledDate.getDate() + days);
      return {
        study_source_id: studySourceId,
        scheduled_at: scheduledDate.toISOString(),
        completed: false,
      };
    });

    const { error: reviewsError } = await (supabase
      .from('reviews') as any)
      .insert(reviews);

    if (reviewsError) {
      console.error('Reviews insert error:', reviewsError);
      // Don't throw - plan is created, reviews are optional
    }

    revalidatePath(`/study/${studySourceId}/plan`);
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw error;
  }
}
