import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, session, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve origin destination if user was redirected by ProtectedRoute
  const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || '/caregiver/dashboard';

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (!loading && session) {
      navigate(destination, { replace: true });
    }
  }, [loading, session, destination, navigate]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate button clicks

    setGeneralError(null);

    const isValid = validate();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const result = await signIn({ email, password });

      if (!result.success) {
        setGeneralError(result.error || 'Invalid email or password.');
        setIsSubmitting(false);
        return;
      }

      // Successful sign-in -> redirect to destination
      navigate(destination, { replace: true });
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-stone-600 hover:text-teal-700 transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <Card padding="lg" className="shadow-md border-stone-200">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="teal" size="sm">Caregiver Access</Badge>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/80">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Caregiver portal to monitor patient schedules and adherence.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {generalError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-900 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{generalError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Email Address"
                placeholder="caregiver@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                  setGeneralError(null);
                }}
                error={fieldErrors.email}
                leftIcon={<Mail className="w-5 h-5" />}
                disabled={isSubmitting}
                required
                autoComplete="email"
              />

              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.password;
                      return next;
                    });
                  }
                  setGeneralError(null);
                }}
                error={fieldErrors.password}
                leftIcon={<Lock className="w-5 h-5" />}
                disabled={isSubmitting}
                required
                autoComplete="current-password"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full text-base"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In as Caregiver'}
                </Button>
              </div>

              <div className="pt-4 text-center border-t border-stone-100">
                <p className="text-sm text-stone-600">
                  Don't have a caregiver account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-teal-700 hover:underline focus-visible:outline-none"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
