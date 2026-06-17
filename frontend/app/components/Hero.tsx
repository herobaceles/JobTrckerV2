"use client";

import { useSession, signOut } from "next-auth/react";
import AuthPanel from "./AuthPanel";

export default function Hero() {
  const { data: session, status } = useSession();

  return (
    <section className="min-h-[90vh] flex flex-col justify-start bg-gray-50">
      {/* Centered, restricted inner container matching navbar perfectly */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-12 md:pt-16 pb-20">
        
        {/* Main Flex Layout Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-16">
          
          {/* Left Side: Editorial Content Layout matched to Auth Card scale */}
          <div className="flex flex-col justify-between text-left space-y-8 w-full lg:max-w-[52%]">
            
            {/* Header Block */}
            <div className="space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-200/60 px-3 py-1 rounded-none">
                Streamline your search
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.05]">
                Job Tracking <br />
                <span className="text-gray-400">Made Simple.</span>
              </h1>
            </div>

            {/* Sub-headline & Description Section */}
            <div className="space-y-4 border-l-2 border-gray-900 pl-4 py-1">
              <p className="text-xl font-bold text-gray-800 tracking-tight">
                Take complete control over your application pipeline.
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                Stop losing track of open applications, critical interview dates, and manual follow-up threads. Our centralized visual workspace monitors every single stage of your job hunt so you can drop disorganized spreadsheets, apply smarter, and land offers faster.
              </p>
            </div>

            {/* Quick Stats Grid - Enhanced with clean borders matching the Auth Card */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200">
              <div className="space-y-1">
                <p className="text-2xl font-black text-gray-900 tracking-tight">100%</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Free Platform</p>
              </div>
              <div className="space-y-1 border-l border-gray-200 pl-4">
                <p className="text-2xl font-black text-gray-900 tracking-tight">1-Click</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Google Sync</p>
              </div>
              <div className="space-y-1 border-l border-gray-200 pl-4">
                <p className="text-2xl font-black text-gray-900 tracking-tight">Visual</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kanban Board</p>
              </div>
            </div>

          </div>

          {/* Right Side: Auth Action Area */}
          <div className="flex justify-center lg:justify-end w-full lg:w-auto flex-shrink-0">
            {status === "loading" ? (
              /* Matches the exact size blueprint of your updated AuthPanel */
              <div className="h-[520px] w-full max-w-xl bg-white border border-gray-200 animate-pulse" />
            ) : session ? (
              <div className="w-full max-w-xl p-12 bg-white border border-gray-200 shadow-sm text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">Welcome Back</h3>
                  <p className="text-base text-gray-500">
                    Logged in as <span className="font-semibold text-gray-800">{session.user?.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white text-base font-semibold transition tracking-wide"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <AuthPanel />
            )}
          </div>

        </div>

        {/* Feature Footer - Balanced with spacing below the primary row elements */}
        <div className="mt-24 pt-10 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 tracking-tight text-base">Centralized Dashboard</h4>
            <p className="leading-relaxed">See your interview statuses, upcoming system tasks, and total outstanding offers compiled safely in one workspace.</p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 tracking-tight text-base">No More Spreadsheets</h4>
            <p className="leading-relaxed">Ditch clumsy sheets for a beautiful, dedicated platform designed fundamentally around the high-speed applicant journey.</p>
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-gray-900 tracking-tight text-base">Secure Authentication</h4>
            <p className="leading-relaxed">Log in securely with your Google Profile instantly without inventing or memorizing another unique password sequence.</p>
          </div>
        </div>
        
      </div>
    </section>
  );
}