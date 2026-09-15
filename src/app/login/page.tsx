'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex flex-col relative bg-white min-h-screen md:min-h-0">
        
        {/* Top Header */}
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-wide text-slate-800">VAULT X</span>
          </div>
          <div className="font-semibold text-slate-800 text-sm md:text-base">
            Secure Login
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-32">
          <div className="w-full max-w-sm">
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter Email Address"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2" htmlFor="password">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-md border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter Master Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3.5 px-4 rounded-md transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>


            
          </div>
        </div>


      </div>

      {/* RIGHT SIDE - ILLUSTRATION */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden bg-[#0A1A2F]">
        <img 
          src="/vault-bg.jpg" 
          alt="Digital Security Vault" 
          className="w-full h-full object-cover" 
        />
        {/* Yellow overlay styling to match the theme (softened) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0A1A2F]/50 via-transparent to-yellow-400/20"></div>
      </div>

    </div>
  );
}
