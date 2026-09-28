import { describe, it, expect, beforeEach } from 'vitest';
import { patientService } from '../services/patientService.js';

describe('Phase 3 — PatientService Validation and Rules', () => {
  it('rejects patient creation when full name is empty', async () => {
    const res = await patientService.createPatient({
      fullName: '   ',
      age: 72,
      photoUrl: 'https://example.com/photo.jpg',
    });

    expect(res.patient).toBeNull();
    expect(res.error).toBe("Please enter the patient's name.");
  });

  it('rejects patient creation when age is invalid or zero', async () => {
    const resZero = await patientService.createPatient({
      fullName: 'Lakshmi Devi',
      age: 0,
      photoUrl: 'https://example.com/photo.jpg',
    });
    expect(resZero.patient).toBeNull();
    expect(resZero.error).toBe('Please enter a valid age.');

    const resNegative = await patientService.createPatient({
      fullName: 'Lakshmi Devi',
      age: -5,
      photoUrl: 'https://example.com/photo.jpg',
    });
    expect(resNegative.patient).toBeNull();
    expect(resNegative.error).toBe('Please enter a valid age.');
  });

  it('rejects patient creation when photo URL is missing', async () => {
    const res = await patientService.createPatient({
      fullName: 'Lakshmi Devi',
      age: 74,
      photoUrl: '',
    });

    expect(res.patient).toBeNull();
    expect(res.error).toBe('Please upload a patient photo.');
  });

  it('successfully creates patient with required fields and assigns creator as primary caregiver', async () => {
    const res = await patientService.createPatient({
      fullName: 'Ramesh Sharma',
      age: 78,
      photoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      photoPublicId: 'sample-id',
    });

    expect(res.error).toBeNull();
    expect(res.patient).not.toBeNull();
    expect(res.patient?.full_name).toBe('Ramesh Sharma');
    expect(res.patient?.age).toBe(78);
    expect(res.patient?.is_primary).toBe(true);
  });
});

describe('Phase 3 — Multi-Caregiver Rules & Boundaries', () => {
  let createdPatientId: string;

  beforeEach(async () => {
    const res = await patientService.createPatient({
      fullName: 'Sita Ram',
      age: 81,
      photoUrl: 'https://res.cloudinary.com/demo/image/upload/sita.jpg',
    });
    createdPatientId = res.patient!.id;
  });

  it('allows adding a 2nd and 3rd caregiver, but rejects a 4th caregiver (enforcing max 3 caregivers)', async () => {
    // Caregiver 1 is the creator (primary)
    // Add caregiver 2
    const cg2 = await patientService.addCaregiverToPatient(
      createdPatientId,
      'caregiver2@example.com'
    );
    expect(cg2.error).toBeNull();
    expect(cg2.caregiver).not.toBeNull();
    expect(cg2.caregiver?.is_primary).toBe(false);

    // Add caregiver 3
    const cg3 = await patientService.addCaregiverToPatient(
      createdPatientId,
      'caregiver3@example.com'
    );
    expect(cg3.error).toBeNull();
    expect(cg3.caregiver).not.toBeNull();
    expect(cg3.caregiver?.is_primary).toBe(false);

    // Attempt to add a 4th caregiver -> must reject
    const cg4 = await patientService.addCaregiverToPatient(
      createdPatientId,
      'caregiver4@example.com'
    );
    expect(cg4.caregiver).toBeNull();
    expect(cg4.error).toContain('Maximum limit reached: A patient cannot have more than 3 caregivers.');
  });

  it('retrieves patient details with caregiver relationship', async () => {
    const res = await patientService.getPatientById(createdPatientId);
    expect(res.error).toBeNull();
    expect(res.patient).not.toBeNull();
    expect(res.patient?.full_name).toBe('Sita Ram');
    expect(res.patient?.age).toBe(81);
    expect(res.patient?.is_primary).toBe(true);
  });

  it('updates patient details when requested', async () => {
    const res = await patientService.updatePatient(createdPatientId, {
      fullName: 'Sita Devi Sharma',
      age: 82,
    });
    expect(res.error).toBeNull();
    expect(res.patient?.full_name).toBe('Sita Devi Sharma');
    expect(res.patient?.age).toBe(82);
  });

  it('deletes patient record successfully', async () => {
    const res = await patientService.deletePatient(createdPatientId);
    expect(res.success).toBe(true);

    const lookup = await patientService.getPatientById(createdPatientId);
    expect(lookup.patient).toBeNull();
  });
});
