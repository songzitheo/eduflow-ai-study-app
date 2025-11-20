'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { IoLogoGoogle } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ActionResponse } from '@/types/action-response';

const titleMap = {
  login: 'Welcome back to EduFlow',
  signup: 'Join EduFlow and start learning smarter with AI',
} as const;

export function AuthUI({
  mode,
  signInWithOAuth,
  signInWithEmail,
}: {
  mode: 'login' | 'signup';
  signInWithOAuth: (provider: 'google') => Promise<ActionResponse>;
  signInWithEmail: (email: string) => Promise<ActionResponse>;
}) {
  const [pending, setPending] = useState(false);
  const [emailFormOpen, setEmailFormOpen] = useState(false);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.target as HTMLFormElement;
    const email = form['email'].value;
    const response = await signInWithEmail(email);

    if (response?.error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while authenticating. Please try again.',
      });
    } else {
      toast({
        description: `To continue, click the link in the email sent to: ${email}`,
      });
    }

    form.reset();
    setPending(false);
  }

  async function handleOAuthClick() {
    setPending(true);
    const response = await signInWithOAuth('google');

    if (response?.error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while authenticating. Please try again.',
      });
      setPending(false);
    }
  }

  return (
    <section className='mt-16 flex w-full flex-col gap-16 rounded-lg bg-white border border-gray-200 p-10 px-4 text-center shadow-sm'>
      <div className='flex flex-col gap-4'>
        <div className='bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 w-20 h-20 flex items-center justify-center m-auto'>
          <GraduationCap className='w-12 h-12 text-white' />
        </div>
        <h1 className='text-2xl font-semibold text-gray-900'>{titleMap[mode]}</h1>
      </div>
      <div className='flex flex-col gap-4'>
        <button
          className='flex items-center justify-center gap-2 rounded-md bg-cyan-500 py-4 font-medium text-black transition-all hover:bg-cyan-400 disabled:bg-neutral-700'
          onClick={handleOAuthClick}
          disabled={pending}
        >
          <IoLogoGoogle size={20} />
          Continue with Google
        </button>

        <Collapsible open={emailFormOpen} onOpenChange={setEmailFormOpen}>
          <CollapsibleTrigger asChild>
            <button
              className='text-gray-700 flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 py-4 font-medium transition-all hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-500'
              disabled={pending}
            >
              Continue with Email
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='mt-[-2px] w-full rounded-b-md bg-gray-50 p-8'>
              <form onSubmit={handleEmailSubmit}>
                <Input
                  type='email'
                  name='email'
                  placeholder='Enter your email'
                  aria-label='Enter your email'
                  autoFocus
                />
                <div className='mt-4 flex justify-end gap-2'>
                  <Button type='button' onClick={() => setEmailFormOpen(false)} variant='outline' className='border-gray-300 hover:bg-gray-100 text-gray-700'>
                    Cancel
                  </Button>
                  <Button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white'>
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      {mode === 'signup' && (
        <span className='text-neutral5 m-auto max-w-sm text-sm'>
          By clicking continue, you agree to our{' '}
          <Link href='/terms' className='underline'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='/privacy' className='underline'>
            Privacy Policy
          </Link>
          .
        </span>
      )}
    </section>
  );
}
