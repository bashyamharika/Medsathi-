import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Heart,
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Input } from '../components/ui/Input.js';
import { useAuth } from '../context/AuthContext.js';
import { patientService } from '../services/patientService.js';
import type { PatientWithRelationship, AssignedCaregiver } from '../types/index.js';

export const PatientCompanionPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patient, setPatient] = useState<PatientWithRelationship | null>(null);
  const [caregivers, setCaregivers] = useState<AssignedCaregiver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Add caregiver state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Delete patient confirmation state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPatientData = async () => {
      if (!patientId) {
        setPageError('Patient ID was not provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPageError(null);

        // 1. Fetch patient details
        const { patient: p, error: pError } = await patientService.getPatientById(patientId);

        if (pError || !p) {
          if (isMounted) {
            setPageError(
              pError ||
                'Patient record could not be found or you do not have permission to access this profile.'
            );
            setLoading(false);
          }
          return;
        }

        // 2. Fetch assigned caregivers
        const { caregivers: cList } = await patientService.getPatientCaregivers(patientId);

        if (isMounted) {
          setPatient(p);
          setCaregivers(cList);
        }
      } catch (err) {
        if (isMounted) {
          setPageError(err instanceof Error ? err.message : 'Error loading patient profile.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPatientData();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  // Handler for adding a secondary caregiver
  const handleAddCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !inviteEmail.trim() || inviteLoading) return;

    setInviteError(null);
    setInviteSuccess(null);
    setInviteLoading(true);

    try {
      const { caregiver, error } = await patientService.addCaregiverToPatient(
        patientId,
        inviteEmail.trim()
      );

      if (error || !caregiver) {
        setInviteError(error || 'Failed to add caregiver.');
      } else {
        setCaregivers((prev) => [...prev, caregiver]);
        setInviteEmail('');
        setInviteSuccess(`Caregiver ${caregiver.full_name} was successfully added.`);
      }
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Handler for removing a secondary caregiver
  const handleRemoveCaregiver = async (targetUserId: string, caregiverName: string) => {
    if (!patientId) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${caregiverName} from this patient's care circle?`
    );
    if (!confirmed) return;

    try {
      const { success, error } = await patientService.removeCaregiverFromPatient(
        patientId,
        targetUserId
      );

      if (success) {
        setCaregivers((prev) => prev.filter((c) => c.caregiver_user_id !== targetUserId));
      } else {
        alert(error || 'Failed to remove caregiver.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error removing caregiver.');
    }
  };

  // Handler for deleting the patient profile
  const handleDeletePatient = async () => {
    if (!patientId || deleting) return;
    setDeleting(true);

    try {
      const { success, error } = await patientService.deletePatient(patientId);
      if (success) {
        navigate('/caregiver/dashboard', { replace: true });
      } else {
        alert(error || 'Failed to delete patient.');
        setDeleting(false);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting patient.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm animate-pulse mb-4">
          <Heart className="w-8 h-8 stroke-[2.2]" />
        </div>
        <p className="text-base font-bold text-stone-900">Retrieving Patient Profile</p>
        <p className="text-xs text-stone-500 mt-1 max-w-xs">
          Verifying caregiver permissions and database security...
        </p>
      </div>
    );
  }

  if (pageError || !patient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Access Restricted</h2>
        <p className="text-sm text-stone-600 max-w-md mt-2">
          {pageError ||
            'You do not have permission to view this patient profile or the record does not exist.'}
        </p>
        <div className="mt-6">
          <Link to="/caregiver/dashboard">
            <Button variant="primary" size="md">
              Return to Caregiver Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPrimary = patient.is_primary;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/caregiver/dashboard"
          className="inline-flex items-center text-sm font-semibold text-stone-600 hover:text-teal-700 transition-colors gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Caregiver Dashboard
        </Link>
      </div>

      {/* ============================================================ */}
      {/* Patient Profile Hero Card (Mobile-First) */}
      {/* ============================================================ */}
      <Card padding="lg" className="border-stone-200 shadow-sm bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Patient Photo */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-md shrink-0 border-2 border-stone-100 bg-stone-100">
            <img
              src={patient.photo_url}
              alt={patient.full_name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Patient Meta Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge variant="teal" size="sm">
                Protected Patient
              </Badge>
              {isPrimary ? (
                <Badge variant="teal" size="sm">
                  You are Primary Caregiver
                </Badge>
              ) : (
                <Badge variant="stone" size="sm">
                  Secondary Caregiver
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {patient.full_name}
            </h1>

            <p className="text-base font-semibold text-stone-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar className="w-4 h-4 text-stone-400" />
              Age {patient.age} years old
            </p>

            <div className="pt-2 text-xs text-stone-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Registered on{' '}
                {new Date(patient.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================================ */}
      {/* Medication Guidance Notice (Phase 3 Boundary) */}
      {/* ============================================================ */}
      <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-sm text-amber-950">
          <h4 className="font-bold text-base">Medication Guidance Notice</h4>
          <p className="text-sm text-amber-900 leading-relaxed">
            Medication guidance will be introduced in a future phase.
          </p>
          <p className="text-xs text-amber-800 leading-relaxed pt-1">
            In Phase 3, caregiver supervision and multi-caregiver access are fully active. Routine scheduling, AI bottle verification, and spoken voice guidance will be connected in upcoming phases.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Care Circle & Multi-Caregiver Management Section */}
      {/* ============================================================ */}
      <Card padding="lg" className="border-stone-200 shadow-sm bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-700" />
              <span>Care Circle</span>
            </CardTitle>
            <p className="text-xs text-stone-500 mt-0.5">
              Every patient can have up to 3 caregivers collaborating for their wellbeing.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 self-start sm:self-auto">
            {caregivers.length} of 3 Caregivers Assigned
          </span>
        </div>

        {/* Caregiver List */}
        <div className="space-y-3">
          {caregivers.map((cg) => {
            const isThisMe = cg.caregiver_user_id === user?.id;
            return (
              <div
                key={cg.caregiver_user_id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    {cg.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">
                        {cg.full_name} {isThisMe && '(You)'}
                      </span>
                      {cg.is_primary ? (
                        <Badge variant="teal" size="sm">
                          Primary
                        </Badge>
                      ) : (
                        <Badge variant="stone" size="sm">
                          Secondary
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      {cg.relationship_to_patient || 'Caregiver'}
                      {cg.phone ? ` • ${cg.phone}` : ''}
                    </p>
                  </div>
                </div>

                {/* Primary caregiver can remove secondary caregivers */}
                {isPrimary && !cg.is_primary && (
                  <button
                    onClick={() => handleRemoveCaregiver(cg.caregiver_user_id, cg.full_name)}
                    className="self-end sm:self-auto text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Another Caregiver Form (Visible only to Primary Caregiver) */}
        {isPrimary ? (
          caregivers.length < 3 ? (
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-teal-700" />
                Add Another Caregiver
              </h4>
              <p className="text-xs text-stone-500">
                Grant another family member or nurse access by entering their registered MedSathi caregiver email.
              </p>

              {inviteError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              {inviteSuccess && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center gap-2 text-xs text-teal-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{inviteSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddCaregiver} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="caregiver@example.com"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteError(null);
                      setInviteSuccess(null);
                    }}
                    disabled={inviteLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={inviteLoading}
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="shrink-0"
                >
                  Add to Circle
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-stone-100 text-stone-600 text-xs text-center border border-stone-200">
              Maximum capacity reached: 3 caregivers assigned to this patient.
            </div>
          )
        ) : (
          <div className="p-3 rounded-xl bg-stone-100 text-stone-600 text-xs text-center border border-stone-200">
            You are a Secondary Caregiver. Only the Primary Caregiver can add or remove caregivers.
          </div>
        )}
      </Card>

      {/* ============================================================ */}
      {/* Danger Zone: Delete Patient (Primary Caregiver Only) */}
      {/* ============================================================ */}
      {isPrimary && (
        <Card padding="md" className="border-rose-200 bg-rose-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-rose-950">Remove Patient Profile</h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Permanently removes this patient and unlinks all assigned caregivers.
              </p>
            </div>

            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={handleDeletePatient}
                  isLoading={deleting}
                  disabled={deleting}
                >
                  Confirm Delete
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-rose-300 text-rose-700 hover:bg-rose-50 self-start sm:self-auto"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Patient
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Bottom Assurance */}
      <div className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-4">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <span>Row Level Security (RLS) guarantees data privacy between caregiver circles.</span>
      </div>
    </div>
  );
};

export default PatientCompanionPage;
