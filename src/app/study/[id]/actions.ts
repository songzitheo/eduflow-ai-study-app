'use server';

import { revalidatePath } from 'next/cache';

import { openaiClient } from '@/features/study/lib/openai-client';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function generateDiagnosticQuestions(formData: FormData): Promise<void> {
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

    // Fetch the study source
    const { data: studySource, error: fetchError } = await (supabase
      .from('study_sources') as any)
      .select('*')
      .eq('id', studySourceId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !studySource) {
      throw new Error('Study source not found');
    }

    // Check if questions already exist
    const { data: existingQuestions } = await (supabase
      .from('diagnostic_questions') as any)
      .select('id')
      .eq('study_source_id', studySourceId)
      .limit(1);

    if (existingQuestions && existingQuestions.length > 0) {
      // Questions already generated, skip
      return;
    }

    // Generate questions using OpenAI
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert educational assessment designer. Generate 8-10 adaptive diagnostic questions based on the provided study material. 

The questions should:
- Test different cognitive levels (recall, comprehension, application, analysis)
- Cover key concepts from the material
- Be clear and specific
- Help identify knowledge gaps
- Range from basic to advanced difficulty

Return ONLY a JSON array of question strings, nothing else. Example format:
["Question 1?", "Question 2?", "Question 3?"]`,
        },
        {
          role: 'user',
          content: `Study material title: ${studySource.title}\n\nContent:\n${studySource.raw_text}`,
        },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse the JSON array of questions
    const questions: string[] = JSON.parse(responseText.trim());

    // Insert questions into database
    const questionsToInsert = questions.map((question, index) => ({
      study_source_id: studySourceId,
      question: question,
      order_index: index,
    }));

    const { error: insertError } = await (supabase
      .from('diagnostic_questions') as any)
      .insert(questionsToInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save questions');
    }

    // Revalidate the page to show the questions
    revalidatePath(`/study/${studySourceId}`);
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

export async function submitAnswer(formData: FormData): Promise<void> {
  try {
    const questionId = formData.get('questionId') as string;
    const userAnswer = formData.get('answer') as string;
    const studySourceId = formData.get('studySourceId') as string;

    if (!questionId || !userAnswer || !studySourceId) {
      throw new Error('Missing required fields');
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

    // Get the question
    const { data: question, error: questionError } = await (supabase
      .from('diagnostic_questions') as any)
      .select('question, study_source_id')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      throw new Error('Question not found');
    }

    // Get study source for context
    const { data: studySource, error: sourceError } = await (supabase
      .from('study_sources') as any)
      .select('raw_text, title')
      .eq('id', studySourceId)
      .single();

    if (sourceError || !studySource) {
      throw new Error('Study source not found');
    }

    // Generate AI feedback
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful learning assistant. Provide brief, constructive feedback (2-3 sentences max) on the student's answer. Be encouraging but honest about gaps. Reference the source material when relevant.`,
        },
        {
          role: 'user',
          content: `Study Material: "${studySource.title}"\n\nQuestion: ${question.question}\n\nStudent Answer: ${userAnswer}\n\nProvide feedback:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiFeedback = completion.choices[0]?.message?.content || 'Thanks for your answer!';

    // Store the answer and feedback
    const { error: insertError } = await (supabase
      .from('diagnostic_answers') as any)
      .insert({
        question_id: questionId,
        user_answer: userAnswer.trim(),
        ai_feedback: aiFeedback,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save answer');
    }

    revalidatePath(`/study/${studySourceId}`);
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
}
