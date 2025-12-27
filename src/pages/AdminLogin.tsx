import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  login,
  isAuthenticated,
  checkSessionExpiry,
  initializeAdminUser,
  checkEmailExists,
  generateOTP,
  storeOTP,
  sendOTPEmail,
  verifyOTP,
  updatePassword
} from '@/lib/adminAuth';
import { Loader2, Mail, KeyRound, Lock, ArrowLeft, Check } from 'lucide-react';

type ForgotPasswordStep = 'email' | 'otp' | 'newPassword' | 'success';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotUsername, setForgotUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    // Check session expiry on load
    checkSessionExpiry();

    // Initialize admin user in Firebase if not exists
    initializeAdminUser();

    if (isAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(username, password);

    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
      setPassword('');
    }

    setIsLoading(false);
  };

  // Forgot Password Handlers
  const handleEmailSubmit = async () => {
    setForgotError('');
    setForgotLoading(true);

    const result = await checkEmailExists(forgotEmail);

    if (result.exists && result.username) {
      setForgotUsername(result.username);

      // Generate and store OTP
      const generatedOTP = generateOTP();
      const stored = await storeOTP(forgotEmail, generatedOTP);

      if (stored) {
        // Send OTP via EmailJS
        const sent = await sendOTPEmail(forgotEmail, result.username, generatedOTP);

        if (sent) {
          setForgotStep('otp');
        } else {
          setForgotError('Failed to send OTP email. Please try again.');
        }
      } else {
        setForgotError('Failed to generate OTP. Please try again.');
      }
    } else {
      setForgotError('Email not found in our system.');
    }

    setForgotLoading(false);
  };

  const handleOtpSubmit = async () => {
    setForgotError('');
    setForgotLoading(true);

    const result = await verifyOTP(otp);

    if (result.success) {
      setForgotStep('newPassword');
    } else {
      setForgotError(result.message);
    }

    setForgotLoading(false);
  };

  const handlePasswordSubmit = async () => {
    setForgotError('');

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);

    const updated = await updatePassword(newPassword);

    if (updated) {
      setForgotStep('success');
    } else {
      setForgotError('Failed to update password. Please try again.');
    }

    setForgotLoading(false);
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotUsername('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
  };

  useEffect(() => {
    document.body.classList.add('admin-panel');
    return () => document.body.classList.remove('admin-panel');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">

          {/* Forgot Password Modal */}
          {showForgotPassword ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <button
                  onClick={resetForgotPassword}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
                  <p className="text-sm text-muted-foreground">
                    {forgotStep === 'email' && 'Enter your email to receive OTP'}
                    {forgotStep === 'otp' && 'Enter the OTP sent to your email'}
                    {forgotStep === 'newPassword' && 'Set your new password'}
                    {forgotStep === 'success' && 'Password updated successfully!'}
                  </p>
                </div>
              </div>

              {/* Step: Email */}
              {forgotStep === 'email' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      placeholder="Enter your email"
                    />
                  </div>

                  {forgotError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                      {forgotError}
                    </div>
                  )}

                  <button
                    onClick={handleEmailSubmit}
                    disabled={!forgotEmail || forgotLoading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending OTP...</>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </div>
              )}

              {/* Step: OTP */}
              {forgotStep === 'otp' && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm">
                    OTP sent to {forgotEmail}. Check your inbox!
                  </div>

                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-center text-2xl tracking-widest"
                      placeholder="● ● ● ● ● ●"
                      maxLength={6}
                    />
                  </div>

                  {forgotError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                      {forgotError}
                    </div>
                  )}

                  <button
                    onClick={handleOtpSubmit}
                    disabled={otp.length !== 6 || forgotLoading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </div>
              )}

              {/* Step: New Password */}
              {forgotStep === 'newPassword' && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm">
                    OTP verified! Set your new password.
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      placeholder="New password"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {forgotError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                      {forgotError}
                    </div>
                  )}

                  <button
                    onClick={handlePasswordSubmit}
                    disabled={!newPassword || !confirmPassword || forgotLoading}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              )}

              {/* Step: Success */}
              {forgotStep === 'success' && (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-foreground">Your password has been updated successfully!</p>
                  <button
                    onClick={resetForgotPassword}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login Form */
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
                <p className="text-muted-foreground">Portfolio Management System</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="Enter password"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Logging in...</>
                  ) : (
                    'Login'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-primary text-sm hover:underline"
                >
                  Forgot Password?
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-4">
          Portfolio Admin Panel v2.0 • Session expires in 2 hours
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
