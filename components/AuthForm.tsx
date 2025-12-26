
import React, { useState } from 'react';
import { login, sendVerificationOtp, verifyOtpAndSignup } from '../services/authService';
import { User } from '../types';

interface AuthFormProps {
  onAuthComplete: (user: User, token: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setLoading(false);
    setStep('info');
    setOtp('');
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await login(email, password);
        onAuthComplete(result.user, result.token);
      } else {
        // Validation for signup
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        await sendVerificationOtp(name, email);
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await verifyOtpAndSignup(email, otp, password);
      // Auto login
      const result = await login(email, password);
      onAuthComplete(result.user, result.token);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
        <div className="p-8 pb-4">
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl ${step === 'otp' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-indigo-600 shadow-indigo-100'}`}>
              <i className={`fas ${step === 'otp' ? 'fa-envelope-open-text' : isLogin ? 'fa-lock' : 'fa-user-plus'} text-2xl`}></i>
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
            {step === 'otp' ? 'Verify Email' : isLogin ? 'Welcome Back' : 'Join StudyEasierAI'}
          </h2>
          <p className="text-center text-slate-500 mb-8 font-medium">
            {step === 'otp' ? `We sent a code to ${email}` : isLogin ? 'Log in to access your study materials' : 'Start your journey to smarter learning'}
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg flex items-center gap-3">
              <i className="fas fa-exclamation-circle shrink-0"></i>
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
          )}

          {step === 'info' ? (
            <form onSubmit={handleInitialSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                      <i className="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-950 font-semibold placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <i className="fas fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-950 font-semibold placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <i className="fas fa-key"></i>
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-slate-950 font-semibold placeholder:text-slate-400"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wide">Rewrite Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                      <i className="fas fa-shield-alt"></i>
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full pl-11 pr-4 py-3 bg-white border-2 rounded-xl focus:ring-2 outline-none transition-all text-slate-950 font-semibold placeholder:text-slate-400 ${
                        confirmPassword && password !== confirmPassword 
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-indigo-600 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500 font-bold">Passwords do not match yet.</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!isLogin && password !== confirmPassword)}
                className={`w-full py-4 text-white rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4 uppercase tracking-widest text-sm ${
                  isLogin ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
                }`}
              >
                {loading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-paper-plane'}`}></i>
                )}
                {isLogin ? 'Sign In' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-black text-slate-800 mb-4 uppercase tracking-wide text-center">Verification Code</label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-48 text-center text-4xl font-black tracking-[0.2em] py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-emerald-600 placeholder:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                  {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-user-check"></i>}
                  Verify & Create Account
                </button>
                
                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="w-full py-3 bg-white text-slate-500 font-bold hover:text-slate-700 transition-all text-xs uppercase tracking-widest"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Edit Information
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 font-medium">
                Didn't receive a code? <button type="button" onClick={() => sendVerificationOtp(name, email)} className="text-emerald-600 font-black hover:underline">Resend</button>
              </p>
            </form>
          )}
        </div>
        
        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-slate-700 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleMode}
              className="ml-2 text-indigo-600 font-black hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
