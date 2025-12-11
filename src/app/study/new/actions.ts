'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

// Use pdf-parse-fork which is more compatible with serverless environments
const parsePDF = async (buffer: Buffer): Promise<{ text: string; numpages: number }> => {
  const pdf = require('pdf-parse-fork');
  return pdf(buffer);
};

export async function createStudySource(formData: FormData): Promise<void> {
  try {
    // Extract form data
    const title = formData.get('title') as string;
    const rawText = formData.get('rawText') as string;
    const deadline = formData.get('deadline') as string;

    // Validate required fields
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }

    if (!rawText || rawText.trim() === '') {
      throw new Error('Content is required');
    }

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('You must be logged in to create a study source');
    }

    // Prepare data for insertion
    const insertData: {
      user_id: string;
      title: string;
      raw_text: string;
      deadline_date?: string;
    } = {
      user_id: user.id,
      title: title.trim(),
      raw_text: rawText.trim(),
    };

    // Add deadline if provided
    if (deadline && deadline.trim() !== '') {
      insertData.deadline_date = deadline.trim();
    }

    // Insert into study_sources table
    // Type assertion needed since study_sources table is not yet in the generated types
    const { data, error: insertError } = await (supabase
      .from('study_sources') as any)
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to create study source');
    }

    // Redirect to the created study source or home page
    // Type assertion needed since study_sources table is not yet in the generated types
    redirect(`/study/${(data as any).id}`);
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
}

export async function createStudySourceFromPDF(formData: FormData): Promise<void> {
  try {
    // Extract form data
    const title = formData.get('title') as string;
    const pdfFile = formData.get('pdfFile') as File;
    const deadline = formData.get('deadline') as string;

    // Validate required fields
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }

    if (!pdfFile || pdfFile.size === 0) {
      throw new Error('PDF file is required');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (pdfFile.size > maxSize) {
      throw new Error(`PDF file is too large. Maximum size is 10MB. Your file is ${(pdfFile.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Validate file type
    if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Only PDF files are allowed');
    }

    // Convert file to buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Processing PDF: ${pdfFile.name}, Size: ${pdfFile.size} bytes`);

    // Extract text from PDF
    let pdfData;
    try {
      pdfData = await parsePDF(buffer);
      console.log(`PDF parsed successfully. Pages: ${pdfData.numpages}, Text length: ${pdfData.text.length}`);
    } catch (pdfError: any) {
      console.error('PDF parsing error:', pdfError);
      console.error('Error details:', {
        message: pdfError.message,
        stack: pdfError.stack,
        name: pdfError.name,
      });
      throw new Error(`Failed to parse PDF: ${pdfError.message || 'Unknown error'}. Please try a different PDF file.`);
    }

    const extractedText = pdfData.text.trim();

    if (!extractedText || extractedText.length === 0) {
      throw new Error('No text could be extracted from the PDF. The PDF might be image-based or protected. Please use a PDF with selectable text.');
    }

    console.log(`Extracted ${extractedText.length} characters from PDF`);

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('You must be logged in to create a study source');
    }

    // Prepare data for insertion
    const insertData: {
      user_id: string;
      title: string;
      raw_text: string;
      deadline_date?: string;
    } = {
      user_id: user.id,
      title: title.trim(),
      raw_text: extractedText,
    };

    // Add deadline if provided
    if (deadline && deadline.trim() !== '') {
      insertData.deadline_date = deadline.trim();
    }

    // Insert into study_sources table
    const { data, error: insertError } = await (supabase
      .from('study_sources') as any)
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to create study source');
    }

    // Redirect to the created study source
    redirect(`/study/${(data as any).id}`);
  } catch (error) {
    console.error('Unexpected error:', error);
    throw error;
  }
}
