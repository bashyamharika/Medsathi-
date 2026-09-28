import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartHandshake,
  ArrowLeft,
  MailCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';
import type { SignUpFormData } from '../types/index.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, session, loading } = useAuth();

  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    age: '',
    phone: '',
    relationshipToPatient: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<
    'idle' | 'validating' | 'creating_account' | 'creating_profile' | 'done'
  >('idle');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  // If already authenticated, redirect to caregiver dashboard
  useEffect(() => {
    if (!loading && session) {
      navigate('/caregiver/dashboard', { replace: true });
    }
  }, [loading, session, navigate]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters long.';
    }

    // Age validation (sensible range for caregiver)
    if (formData.age.trim()) {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 110) {
        errors.age = 'Please enter a valid age between 18 and 110.';
      }
    }

    // Phone validation
    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
        errors.phone = 'Please enter a valid phone number (7-15 digits).';
      }
    }

    // Relationship to patient
    if (!formData.relationshipToPatient.trim()) {
      errors.relationshipToPatient = 'Please specify your relationship (e.g., Son, Daughter, Nurse).';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    // Confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingStep !== 'idle') return; // Prevent duplicate submissions

    setGeneralError(null);
    setLoadingStep('validating');

    const isValid = validate();
    if (!isValid) {
      setLoadingStep('idle');
      return;
    }

    setLoadingStep('creating_account');

    try {
      const result = await signUp(formData);

      if (!result.success) {
        setGeneralError(result.error || 'Registration failed. Please check your information.');
        setLoadingStep('idle');
        return;
      }

      if (result.requiresEmailConfirmation) {
        setEmailConfirmationRequired(true);
        setLoadingStep('done');
        return;
      }

      // If email confirmation is disabled or session is directly active
      setLoadingStep('creating_profile');
      setTimeout(() => {
        setLoadingStep('done');
        navigate('/caregiver/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoadingStep('idle');
    }
  };

  // State: Email verification required screen
  if (emailConfirmationRequired) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card padding="xl" className="w-full max-w-md text-center shadow-md border-teal-200">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-stone-900">
            Account Created
          </CardTitle>
          <p className="text-base text-stone-600 mt-2 leading-relaxed">
            Your caregiver account for <strong className="text-stone-900">{formData.email}</strong> has been successfully registered.
          </p>
          <div className="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <CheckCircle2 className="w-4 h-4 text-amber-700" />
              Email Verification Required
            </div>
            <p>
              Please check your inbox and click the verification link before logging into your MedSathi portal.
            </p>
          </div>
          <Link to="/login">
            <Button variant="primary" size="lg" className="w-full">
              Proceed to Log In
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isSubmitting = loadingStep !== 'idle';

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-10">
      <div className="w-full max-w-xl">
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
              <Badge variant="teal" size="sm">Caregiver Registration</Badge>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/80">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Create Caregiver Account</CardTitle>
            <CardDescription>
              Join MedSathi to support your loved ones with seamless, dignified medication oversight.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {generalError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-900">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{generalError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <Input
                name="fullName"
                type="text"
                label="Full Name *"
                placeholder="e.g. Maya Sharma"
                value={formData.fullName}
                onChange={handleChange}
                error={fieldErrors.fullName}
                leftIcon={<User className="w-5 h-5" />}
                disabled={isSubmitting}
                required
              />

              {/* Age and Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="age"
                  type="number"
                  label="Caregiver Age"
                  placeholder="e.g. 42"
                  min={18}
                  max={110}
                  value={formData.age}
                  onChange={handleChange}
                  error={fieldErrors.age}
                  leftIcon={<Calendar className="w-5 h-5" />}
                  disabled={isSubmitting}
                />

                <Input
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  error={fieldErrors.phone}
                  leftIcon={<Phone className="w-5 h-5" />}
                  disabled={isSubmitting}
                />
              </div>

              {/* Relationship to patient */}
              <Input
                name="relationshipToPatient"
                type="text"
                label="Relationship to Patient *"
                placeholder="e.g. Daughter, Son, Spouse, Professional Caregiver"
                value={formData.relationshipToPatient}
                onChange={handleChange}
                error={fieldErrors.relationshipToPatient}
                helperText="Helps personalize alerts and caregiver notifications"
                leftIcon={<Users className="w-5 h-5" />}
                disabled={isSubmitting}
                required
              />

              {/* Email */}
              <Input
                name="email"
                type="email"
                label="Email Address *"
                placeholder="caregiver@example.com"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                leftIcon={<Mail className="w-5 h-5" />}
                disabled={isSubmitting}
                required
                autoComplete="email"
              />

              {/* Password and Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  name="password"
                  type="password"
                  label="Password *"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  leftIcon={<Lock className="w-5 h-5" />}
                  disabled={isSubmitting}
                  required
                  autoComplete="new-password"
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm Password *"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={fieldErrors.confirmPassword}
                  leftIcon={<Lock className="w-5 h-5" />}
                  disabled={isSubmitting}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full text-base"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {loadingStep === 'validating'
                    ? 'Validating Details...'
                    : loadingStep === 'creating_account'
                    ? 'Creating Account...'
                    : loadingStep === 'creating_profile'
                    ? 'Establishing Caregiver Profile...'
                    : 'Create Caregiver Account'}
                </Button>
              </div>

              <div className="pt-4 text-center border-t border-stone-100">
                <p className="text-sm text-stone-600">
                  Already registered as a caregiver?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-teal-700 hover:underline focus-visible:outline-none"
                  >
                    Sign in here
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

export default RegisterPage;
