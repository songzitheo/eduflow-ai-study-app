import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Logo() {
  return (
    <Link href='/' className='flex w-fit items-center gap-2 group'>
      <div className='bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-2 group-hover:from-blue-600 group-hover:to-purple-700 transition-all'>
        <GraduationCap className='w-6 h-6 text-white' />
      </div>
      <span className='font-semibold text-xl text-gray-900'>EduFlow</span>
    </Link>
  );
}
