
import React, { useState } from 'react';
import { login, signup } from '../services/authService';
import { User } from '../types';

interface AuthFormProps {
  onAuthComplete: (user: User, token: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await login(email, password);
        onAuthComplete(result.user, result.token);
      } else {
        const user = await signup(name, email, password);
        // Automatically login after signup
        const result = await login(email, password);
        onAuthComplete(result.user, result.token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
        <div className="p-8 pb-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <i className="fas fa-lock text-2xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Join StudyEasierAI'}
          </h2>
          <p className="text-center text-slate-500 mb-8 font-medium">
            {isLogin ? 'Log in to access your study materials' : 'Start your journey to smarter learning'}
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg flex items-center gap-3">
              <i className="fas fa-exclamation-circle"></i>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="name@company.com"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <i className="fas fa-circle-notch animate-spin"></i>
              ) : (
                <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
              )}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
        
        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-slate-700 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
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
