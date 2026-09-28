import { describe, it, expect } from 'vitest';
import { authService } from '../services/authService.js';
import { profileService } from '../services/profileService.js';

describe('AuthService — Error Handling and Formatting', () => {
  it('formats invalid login credentials error with friendly healthcare message', () => {
    const error = new Error('Invalid login credentials');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('Invalid email or password. Please check your credentials and try again.');
  });

  it('formats user already registered error', () => {
    const error = new Error('User already registered');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('An account with this email address already exists. Please sign in instead.');
  });

  it('formats unconfirmed email error', () => {
    const error = new Error('Email not confirmed');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('Please verify your email before signing in. A confirmation link was sent to your inbox.');
  });

  it('formats weak password error', () => {
    const error = new Error('Password should be at least 6 characters');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('Password must be at least 6 characters long.');
  });

  it('formats invalid email format error', () => {
    const error = new Error('Unable to validate email address: invalid format');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('Please enter a valid email address.');
  });

  it('formats rate limit error', () => {
    const error = new Error('over_request_rate_limit: too many requests');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('Too many login attempts. Please wait a few moments before trying again.');
  });

  it('formats network error', () => {
    const error = new Error('Failed to fetch');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('Unable to reach the server. Please check your network connection.');
  });

  it('provides safe fallback for unexpected errors', () => {
    const error = new Error('Some unexpected 500 error code');
    const msg = authService.formatAuthError(error);
    expect(msg).toBe('Something went wrong. Please check your details and try again.');
  });
});

describe('ProfileService — Fallback & Resilience', () => {
  it('returns mock profile structure when unconfigured', async () => {
    const res = await profileService.getMyProfile('test-caregiver-uid');
    expect(res.error).toBeNull();
    expect(res.profile).not.toBeNull();
    expect(res.profile?.role).toBe('caregiver');
    expect(res.profile?.user_id).toBe('test-caregiver-uid');
  });

  it('creates mock profile safely when unconfigured', async () => {
    const res = await profileService.createProfile({
      userId: 'test-new-uid',
      fullName: 'Aarav Patel',
      age: 45,
      phone: '+91 98765 00000',
      relationshipToPatient: 'Son',
    });
    expect(res.error).toBeNull();
    expect(res.profile?.user_id).toBe('test-new-uid');
    expect(res.profile?.full_name).toBe('Aarav Patel');
    expect(res.profile?.age).toBe(45);
    expect(res.profile?.relationship_to_patient).toBe('Son');
  });
});
