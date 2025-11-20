import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, Brain, Calendar, CheckCircle2, Sparkles, Target } from 'lucide-react';

import { Container } from '@/components/container';
import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-transparent to-transparent" />
      <Container className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 border border-blue-200 px-4 py-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Study Assistant</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Master Any Subject with</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> AI-Driven </span>
            <span className="text-gray-900">Learning</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your study materials into personalized learning plans. Get AI-generated diagnostic questions, 
            tailored study schedules, and spaced repetition reviews—all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-300 hover:bg-gray-100">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'AI Diagnostic Questions',
      description: 'Get personalized questions generated from your study materials to identify knowledge gaps.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      icon: Target,
      title: 'Personalized Learning Plans',
      description: 'Receive a structured macro-meso-micro study plan tailored to your deadlines and progress.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      icon: Calendar,
      title: 'Spaced Repetition Reviews',
      description: 'Automated review scheduling at J+2, J+7, and J+21 intervals for optimal retention.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      icon: BookOpen,
      title: 'Study Source Management',
      description: 'Upload and organize all your study materials in one central, easy-to-access location.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
  ];

  return (
    <section className="py-24 border-b border-gray-200">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Study Smarter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Leverage the power of AI to create a personalized study experience that adapts to your learning style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`bg-white border ${feature.borderColor} rounded-xl p-8 hover:border-gray-300 transition-colors shadow-sm`}
            >
              <div className={`${feature.bgColor} rounded-lg w-12 h-12 flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Upload Your Study Material',
      description: 'Paste your lecture notes, textbook chapters, or any study content you want to master.',
    },
    {
      number: '02',
      title: 'Answer Diagnostic Questions',
      description: 'Our AI generates questions to assess your current understanding and identify gaps.',
    },
    {
      number: '03',
      title: 'Get Your Learning Plan',
      description: 'Receive a personalized study schedule broken down into manageable phases and tasks.',
    },
    {
      number: '04',
      title: 'Review with Spaced Repetition',
      description: 'Complete automated reviews at optimal intervals to maximize long-term retention.',
    },
  ];

  return (
    <section className="py-24 border-b border-gray-200">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to transform your studying from overwhelming to organized.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-8 w-0.5 h-24 bg-gradient-to-b from-gray-300 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24">
      <Container>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-12 text-center shadow-sm">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Study Routine?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join students who are studying smarter with AI-powered learning plans and spaced repetition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/signup">Start Learning Now</Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
