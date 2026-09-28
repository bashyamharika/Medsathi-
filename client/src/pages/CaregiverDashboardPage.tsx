import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserCheck,
  Mail,
  Shield,
  Calendar,
  Phone,
  Users,
  LogOut,
  Sparkles,
  Plus,
  ArrowRight,
  Heart,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';
import { patientService } from '../services/patientService.js';
import type { PatientWithRelationship } from '../types/index.js';

export const CaregiverDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [patients, setPatients] = useState<PatientWithRelationship[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const { patients: data, error } = await patientService.getMyPatients();
        if (isMounted) {
          if (error) {
            setPatientsError(error);
          } else {
            setPatients(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setPatientsError(err instanceof Error ? err.message : 'Failed to load patients.');
        }
      } finally {
        if (isMounted) {
          setLoadingPatients(false);
        }
      }
    };

    loadPatients();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const caregiverName = profile?.full_name || user?.user_metadata?.full_name || 'Caregiver';
  const caregiverEmail = user?.email || 'No email associated';
  const caregiverRole = profile?.role || 'caregiver';

  // Format account creation date
  const rawCreatedAt = profile?.created_at || user?.created_at;
  const memberSince = rawCreatedAt
    ? new Date(rawCreatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Phase 3 Milestone Banner */}
      <div className="p-4 md:p-5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <strong className="font-semibold">Phase 3 Active:</strong>{' '}
            <span>Patient Management & Multi-Caregiver isolation verified via Supabase PostgreSQL & RLS.</span>
          </div>
        </div>
        <Badge variant="teal" size="sm" className="self-start sm:self-auto shrink-0">
          Caregiver Session Active
        </Badge>
      </div>

      {/* Header with Welcome and Sign Out */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-teal-700">
            Caregiver Portal
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mt-1">
            Welcome back, {caregiverName}
          </h1>
          <p className="text-stone-600 mt-1 text-base">
            Supervise your loved ones with calm, dignified medication oversight.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4 text-stone-600" />}
          className="self-start md:self-auto"
        >
          Sign Out
        </Button>
      </div>

      {/* ============================================================ */}
      {/* "My Patients" Section */}
      {/* ============================================================ */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
              <span>My Patients</span>
              {!loadingPatients && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                  {patients.length} {patients.length === 1 ? 'person' : 'people'}
                </span>
              )}
            </h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Individuals you supervise and support with their medication routine.
            </p>
          </div>

          <Link to="/caregiver/patients/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Patient
            </Button>
          </Link>
        </div>

        {patientsError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>{patientsError}</div>
          </div>
        )}

        {/* Loading Patients State */}
        {loadingPatients && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm animate-pulse space-y-4"
              >
                <div className="w-full h-48 bg-stone-100 rounded-2xl" />
                <div className="h-5 bg-stone-200 rounded w-1/2" />
                <div className="h-4 bg-stone-100 rounded w-1/3" />
                <div className="h-10 bg-stone-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingPatients && patients.length === 0 && (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-stone-50/70 border-2 border-dashed border-stone-200 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
              <Heart className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-stone-900">No patients registered yet</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Add your loved one or patient to establish their personalized profile, attach a required photo, and prepare for medication companion support.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/caregiver/patients/new">
                <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                  Add First Patient
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Patient Grid */}
        {!loadingPatients && patients.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <Card
                key={patient.id}
                padding="none"
                className="overflow-hidden border-stone-200/90 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white flex flex-col justify-between"
              >
                {/* Patient Photo Container */}
                <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={patient.photo_url}
                    alt={patient.full_name}
                    className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-102"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    {patient.is_primary ? (
                      <Badge variant="teal" size="sm" className="shadow-sm">
                        Primary Caregiver
                      </Badge>
                    ) : (
                      <Badge variant="stone" size="sm" className="shadow-sm">
                        Secondary Caregiver
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Patient Meta Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                      {patient.full_name}
                    </h3>
                    <p className="text-sm font-semibold text-stone-500 mt-0.5">
                      Age {patient.age}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <Link to={`/patient/${patient.id}`} className="block">
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full justify-between group"
                        rightIcon={
                          <ArrowRight className="w-4 h-4 text-stone-500 group-hover:translate-x-0.5 transition-transform" />
                        }
                      >
                        Open Patient
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* Caregiver Profile Details Card */}
      {/* ============================================================ */}
      <Card padding="lg" className="border-stone-200/90 shadow-sm bg-white">
        <CardHeader className="pb-2 border-b border-stone-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
                <UserCheck className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{caregiverName}</CardTitle>
                  <Badge variant="teal" size="sm" className="capitalize">
                    {caregiverRole}
                  </Badge>
                </div>
                <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  {caregiverEmail}
                </p>
              </div>
            </div>

            <div className="text-xs text-stone-500 bg-stone-50 px-3.5 py-2 rounded-2xl border border-stone-200 self-start sm:self-auto">
              <span>Member since: </span>
              <strong className="text-stone-800">{memberSince}</strong>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
            Registered Caregiver Details (Supabase PostgreSQL)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-500">Relationship to Patient</p>
                <p className="text-sm font-bold text-stone-900">
                  {profile?.relationship_to_patient || 'Caregiver'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-500">Contact Number</p>
                <p className="text-sm font-bold text-stone-900">
                  {profile?.phone || 'Not provided'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-500">Caregiver Age</p>
                <p className="text-sm font-bold text-stone-900">
                  {profile?.age ? `${profile.age} years` : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Status Indicator */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Row Level Security (RLS) Active: You can only access patient profiles to which you are assigned.</span>
        </div>
        <span className="font-mono text-[10px] text-stone-400 hidden sm:inline">
          UID: {user?.id}
        </span>
      </div>
    </div>
  );
};

export default CaregiverDashboardPage;
