import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, User, Shield, CheckCircle, ShieldCheck, AlertCircle, KeyRound, Loader2, Bell } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  onLogin: (user: UserType) => void;
}

type AuthStep = 'credentials' | '2fa' | 'success';

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('credentials');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Simulation State
  const [generatedCode, setGeneratedCode] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  
  // Validation State
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simple strength calculator
    let score = 0;
    if (password.length > 7) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setPasswordStrength(score);
  }, [password]);

  const validateForm = () => {
    if (!email.includes('@')) return "Please enter a valid email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!isLogin) {
      if (username.length < 3) return "Username must be at least 3 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
      if (!agreedToTerms) return "You must agree to the Terms & Conditions.";
    }
    return null;
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    
    // Simulate API Check & Generate Code
    setTimeout(() => {
      setLoading(false);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setStep('2fa'); 
      
      // Trigger "Email Received" Simulation
      setTimeout(() => {
          setShowNotification(true);
          // Auto-hide notification after 6 seconds
          setTimeout(() => setShowNotification(false), 6000);
      }, 500);

    }, 1500);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== generatedCode) {
        setError("Invalid verification code. Please check the notification.");
        return;
    }
    setLoading(true);
    
    // Simulate verification
    setTimeout(() => {
        setLoading(false);
        setStep('success');
        
        // Final login trigger after success animation
        setTimeout(() => {
             onLogin({
                username: isLogin ? 'VerifiedUser' : username,
                email: email,
                isPro: false,
                verified: true
             });
        }, 1000);
    }, 1500);
  };

  const renderStrengthBar = () => {
      if (isLogin) return null;
      return (
          <div className="flex gap-1 mt-2 mb-4">
              {[1, 2, 3, 4].map((level) => (
                  <div 
                    key={level} 
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength >= level 
                        ? (passwordStrength < 3 ? 'bg-yellow-500' : 'bg-green-500') 
                        : 'bg-slate-800'
                    }`} 
                  />
              ))}
              <span className="text-[10px] text-slate-500 ml-2">
                  {passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Good' : 'Strong'}
              </span>
          </div>
      );
  };

  return (
    <>
        {/* Simulated OS Notification */}
        <div className={`fixed top-4 right-4 z-[100] transition-all duration-500 transform ${showNotification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl flex gap-4 max-w-sm">
                <div className="bg-blue-600 rounded-lg p-2 h-fit">
                    <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-white">New Email: ShrinkRay Security</h4>
                    <p className="text-xs text-slate-300 mt-1">Your verification code is: <span className="font-mono font-bold text-blue-400 text-base">{generatedCode}</span></p>
                    <p className="text-[10px] text-slate-500 mt-2">Just now • security@shrinkray.ai</p>
                </div>
            </div>
        </div>

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            
            {/* Security Badge Ribbon */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Secure Enclave</span>
            </div>

            {/* Header */}
            <div className="p-8 text-center bg-gradient-to-b from-slate-800/50 to-transparent">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-900/20">
                {step === 'success' ? <CheckCircle className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
                {step === 'credentials' ? (isLogin ? 'Secure Login' : 'Create Account') : 
                step === '2fa' ? 'Two-Factor Authentication' : 'Access Granted'}
            </h2>
            <p className="text-slate-400 text-sm">
                {step === 'credentials' ? 'Enter your credentials to access the secure workspace.' :
                step === '2fa' ? `Enter the code sent to ${email}` :
                'Redirecting to your dashboard...'}
            </p>
            </div>

            {/* Form Body */}
            <div className="p-8 pt-0">
            
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs font-medium animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {step === 'credentials' && (
                <form onSubmit={handleSubmitCredentials} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1 animate-in slide-in-from-left-2">
                            <label className="text-xs font-medium text-slate-300 ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input 
                                type="text" 
                                placeholder="DeveloperOne"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                required
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                        <input 
                        type="email" 
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                        required 
                        />
                    </div>
                    </div>

                    <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                        <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                        required
                        />
                    </div>
                    {renderStrengthBar()}
                    </div>

                    {!isLogin && (
                        <div className="space-y-1 animate-in slide-in-from-left-2">
                            <label className="text-xs font-medium text-slate-300 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                <input 
                                type="password" 
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                required
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="flex items-start gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500/20" 
                            />
                            <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                                I agree to the <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>. I understand this account handles secure data.
                            </label>
                        </div>
                    )}

                    <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group mt-4"
                    >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                        {isLogin ? 'Verify Credentials' : 'Create Secure Account'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                    </button>
                </form>
            )}

            {step === '2fa' && (
                <form onSubmit={handleVerify2FA} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="text-center">
                        <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-800 mb-4 animate-pulse">
                            <KeyRound className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-xs text-slate-500 mb-6">
                            Check the top right of your screen for the simulated code.<br/>
                            This mimics receiving a real email.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <input 
                            type="text" 
                            placeholder="000000"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-center text-3xl tracking-[1em] font-mono bg-slate-950 border border-slate-700 text-white rounded-lg py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-800"
                            autoFocus
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                        >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Verify & Login'
                        )}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setShowNotification(true)}
                        className="w-full text-xs text-slate-500 hover:text-blue-400 transition-colors"
                    >
                        Resend Code
                    </button>
                </form>
            )}

            {step === 'credentials' && (
                <div className="mt-6 text-center border-t border-slate-800 pt-4">
                    <p className="text-slate-400 text-sm">
                    {isLogin ? "New user? " : "Already verified? "}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        {isLogin ? 'Initialize Setup' : 'Log in'}
                    </button>
                    </p>
                </div>
            )}
            </div>
        </div>
        </div>
    </>
  );
};