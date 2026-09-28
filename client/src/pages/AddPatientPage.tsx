import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  User,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { cloudinaryService } from '../services/cloudinary.js';
import { patientService } from '../services/patientService.js';

export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [loadingStep, setLoadingStep] = useState<
    'idle' | 'validating' | 'uploading_photo' | 'creating_patient' | 'done'
  >('idle');

  // Handle image selection
  const handlePhotoSelect = (file: File) => {
    setGeneralError(null);
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type.toLowerCase())) {
      setFieldErrors((prev) => ({
        ...prev,
        photo: 'Please upload a JPG, PNG, or WebP image.',
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        photo: 'Image size is too large. Maximum allowed size is 5MB.',
      }));
      return;
    }

    // Clear photo field error
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Please enter the patient's name.";
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters long.';
    }

    const ageNum = parseInt(age, 10);
    if (!age.trim() || isNaN(ageNum)) {
      errors.age = 'Please enter a valid age.';
    } else if (ageNum <= 0 || ageNum > 125) {
      errors.age = 'Please enter a realistic age between 1 and 125.';
    }

    if (!photoFile) {
      errors.photo = 'Please upload a patient photo.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingStep !== 'idle') return;

    setGeneralError(null);
    setLoadingStep('validating');

    if (!validate()) {
      setLoadingStep('idle');
      return;
    }

    let uploadedPublicId: string | null = null;

    try {
      // 1. Upload photo to Cloudinary via backend endpoint
      setLoadingStep('uploading_photo');
      const uploadResult = await cloudinaryService.uploadPatientPhoto(photoFile!);
      uploadedPublicId = uploadResult.publicId;

      // 2. Create Patient Record & Link as Primary Caregiver
      setLoadingStep('creating_patient');
      const { patient, error } = await patientService.createPatient({
        fullName: fullName.trim(),
        age: parseInt(age, 10),
        photoUrl: uploadResult.secureUrl,
        photoPublicId: uploadedPublicId,
      });

      if (error || !patient) {
        // Attempt cleanup of uploaded photo to prevent orphaned files
        if (uploadedPublicId) {
          await cloudinaryService.deletePatientPhoto(uploadedPublicId).catch(() => {});
        }
        setGeneralError(error || 'Failed to create patient record. Please try again.');
        setLoadingStep('idle');
        return;
      }

      setLoadingStep('done');
      navigate('/caregiver/dashboard', { replace: true });
    } catch (err) {
      // Clean up orphaned photo if uploaded
      if (uploadedPublicId) {
        await cloudinaryService.deletePatientPhoto(uploadedPublicId).catch(() => {});
      }
      setGeneralError(
        err instanceof Error ? err.message : 'An unexpected error occurred while adding patient.'
      );
      setLoadingStep('idle');
    }
  };

  const isSubmitting = loadingStep !== 'idle';

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <Link
            to="/caregiver/dashboard"
            className="inline-flex items-center text-sm font-semibold text-stone-600 hover:text-teal-700 transition-colors gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Caregiver Dashboard
          </Link>
        </div>

        <Card padding="lg" className="shadow-md border-stone-200">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="teal" size="sm">Phase 3 — Patient Setup</Badge>
              <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl">Add Loved One or Patient</CardTitle>
            <CardDescription>
              Create a dedicated profile to manage medication adherence. You will automatically be designated as the Primary Caregiver.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {generalError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-900 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{generalError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Patient Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-stone-900">
                  Patient Photo *
                </label>
                <p className="text-xs text-stone-500 mb-2">
                  A clear, warm photo helps elderly patients recognize their companion screen and caregivers verify identity.
                </p>

                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-teal-600/50 bg-stone-50 p-2 flex items-center gap-4">
                    <img
                      src={photoPreview}
                      alt="Patient Preview"
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-inner border border-stone-200"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        Photo ready for upload
                      </div>
                      <p className="text-xs text-stone-500 truncate max-w-xs">
                        {photoFile?.name} ({(photoFile!.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSubmitting}
                          className="text-xs font-medium text-teal-700 hover:underline cursor-pointer"
                        >
                          Change photo
                        </button>
                        <span className="text-stone-300">|</span>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isSubmitting}
                          className="text-xs font-medium text-rose-600 hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                      fieldErrors.photo
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-stone-300 hover:border-teal-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-stone-800">
                      Click to upload photo or drag and drop
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      JPG, PNG, or WebP (Maximum 5MB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />

                {fieldErrors.photo && (
                  <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.photo}
                  </p>
                )}
              </div>

              {/* Patient Name */}
              <Input
                name="fullName"
                type="text"
                label="Patient Full Name *"
                placeholder="e.g. Lakshmi Devi"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.fullName;
                      return next;
                    });
                  }
                  setGeneralError(null);
                }}
                error={fieldErrors.fullName}
                leftIcon={<User className="w-5 h-5" />}
                disabled={isSubmitting}
                required
              />

              {/* Patient Age */}
              <Input
                name="age"
                type="number"
                label="Patient Age *"
                placeholder="e.g. 74"
                min={1}
                max={125}
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (fieldErrors.age) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.age;
                      return next;
                    });
                  }
                  setGeneralError(null);
                }}
                error={fieldErrors.age}
                helperText="Required to personalize voice pace and guidance in later phases."
                leftIcon={<Calendar className="w-5 h-5" />}
                disabled={isSubmitting}
                required
              />

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full text-base"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  leftIcon={!isSubmitting ? <Upload className="w-5 h-5" /> : undefined}
                >
                  {loadingStep === 'validating'
                    ? 'Validating Details...'
                    : loadingStep === 'uploading_photo'
                    ? 'Uploading Photo to Cloudinary...'
                    : loadingStep === 'creating_patient'
                    ? 'Creating Patient Record...'
                    : 'Create Patient Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPatientPage;
