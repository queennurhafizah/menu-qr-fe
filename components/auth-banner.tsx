'use client';

import { useRouter } from 'next/navigation';

interface AuthBannerProps {
  isSignUp: boolean;
}

export default function AuthBanner({ isSignUp }: AuthBannerProps) {
  const router = useRouter();

  return (
    <div className={`hidden lg:flex absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-purple-700 via-indigo-950 to-slate-950 p-24 flex-col justify-center items-center text-center text-white transition-all duration-700 ease-in-out z-20 ${
      isSignUp 
        ? '-translate-x-full rounded-r-[8rem] rounded-l-none' 
        : 'translate-x-0 rounded-l-[8rem] rounded-r-none'
    }`}>
      <div className="absolute inset-0 bg-[linear-gradient(225deg,transparent_50%,rgba(0,0,0,0.5)_50%)] opacity-40 pointer-events-none"></div>
      
      <div className="relative z-10 space-y-4 max-w-sm">
        <h3 className="text-5xl font-black tracking-tight uppercase">
          {isSignUp ? 'Hello, Friend!' : 'Welcome Back!'}
        </h3>
        <p className="text-sm text-purple-200/70 leading-relaxed font-light">
          {isSignUp 
            ? 'Masukkan detail data diri Anda dan mari bergabung mengelola sistem operasional cafe bersama kami.' 
            : 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aliquid, animi architecto nesciunt omnis ad corrupti.'}
        </p>
        <div className="pt-4">
          <span className="text-xs text-slate-400 block mb-2">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            type="button" 
            // Menggunakan router.push bawaan Next.js agar perpindahan halaman secepat kilat
            onClick={() => router.push(isSignUp ? '/login' : '/signup')} 
            className="text-white border border-white font-bold px-8 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-white hover:text-slate-950 transition active:scale-95"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}