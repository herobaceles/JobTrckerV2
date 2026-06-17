"use client";

import { signIn } from "next-auth/react";

export default function AuthPanel() {
  const handleGoogleAuth = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  // Official Google "G" Icon SVG
  const GoogleIcon = () => (
    <svg
      className="mr-3 h-5 w-5 flex-shrink-0"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    /* REDUCED: Box padding dropped from p-12 to p-8 
      Max-width dropped from max-w-xl to max-w-lg to keep it proportional
    */
    <div className="w-full max-w-lg p-8 bg-white border border-gray-200 shadow-sm rounded-none">
      
      {/* Card Header */}
      {/* REDUCED: Bottom margin dropped from mb-8 to mb-5 */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Get Started
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Simplify your job search pipeline in less than a minute.
        </p>
      </div>

      {/* Feature Highlights */}
      {/* REDUCED: Space between bullets dropped to space-y-2; bottom margin dropped from mb-8 to mb-5; padding dropped to pb-4 */}
      <div className="mb-5 space-y-2 text-sm text-gray-600 border-b border-gray-100 pb-4">
        <div className="flex items-start">
          <span className="text-emerald-600 mr-2 font-bold">✓</span>
          <p>Track unlimited job applications effortlessly</p>
        </div>
        <div className="flex items-start">
          <span className="text-emerald-600 mr-2 font-bold">✓</span>
          <p>Set interview reminders and follow-up deadlines</p>
        </div>
        <div className="flex items-start">
          <span className="text-emerald-600 mr-2 font-bold">✓</span>
          <p>Analyze response rates and dashboard insights</p>
        </div>
      </div>

      {/* Card Body / Actions */}
      {/* REDUCED: Stack gap shrunk from gap-4 to gap-3 */}
      <div className="flex flex-col gap-3">
        
        {/* Sign Up Action */}
        {/* REDUCED: Button padding dropped from py-4 to py-3 */}
        <button
          onClick={handleGoogleAuth}
          className="flex items-center justify-center w-full px-6 py-3 text-sm font-semibold text-white bg-black rounded-none hover:bg-gray-800 transition shadow-sm tracking-wide"
        >
          <GoogleIcon />
          Sign Up with Google
        </button>

        {/* Text Context Divider */}
        {/* REDUCED: Horizontal line line-height padding stripped down */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-3 text-[10px] text-gray-400 uppercase tracking-widest font-bold">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Sign In Action */}
        {/* REDUCED: Button padding dropped from py-4 to py-3 */}
        <button
          onClick={handleGoogleAuth}
          className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-none hover:bg-gray-50 transition shadow-sm"
        >
          <GoogleIcon />
          Sign In with Google
        </button>
      </div>

      {/* Terms & Privacy Disclaimer Footer */}
      {/* REDUCED: Top margin dropped from mt-8 to mt-5 */}
      <div className="mt-5 text-center">
        <p className="text-[11px] text-gray-400 leading-normal">
          By signing up, you agree to our{" "}
          <a href="/terms" className="underline hover:text-gray-600 transition">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-gray-600 transition">Privacy Policy</a>.
          <br />
          We never post to your profile or share your personal data.
        </p>
      </div>
      
    </div>
  );
}