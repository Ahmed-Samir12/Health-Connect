import Doctor from '../doctor/doctorModel.js';
import AppError from '../../utils/AppError.js';
import Email from '../../utils/emails.js';
import * as doctorServices from '../doctor/doctorServices.js';

/**
 * Approve doctor application
 * @param {string} doctorId - Doctor's ID
 * @returns {Object} Approved doctor
 */

export const approveDoctor = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId).populate({
    path: 'user',
    select: 'name email',
  });

  if (!doctor) throw new AppError('Doctor not found!', 404);

  doctorServices.validateDoctorForApproval(doctor);

  doctor.verificationStatus = 'approved';
  doctor.rejectionReason = undefined;
  await doctor.save();

  try {
    await new Email(doctor.user, '').sendDoctorApprove();
  } catch (err) {
    console.log(err);
  }

  return { doctor };
};

export const rejectDoctor = async (doctorId, reason) => {
  if (!reason || reason.trim().length < 10)
    throw new AppError('Rejection reason must be at least 10 characters', 400);

  const doctor = await Doctor.findById(doctorId).populate({
    path: 'user',
    select: 'name email',
  });

  if (!doctor) throw new AppError('Doctor not found!', 404);

  if (doctor.verificationStatus === 'approved')
    throw new AppError('Cannot reject an approved doctor', 400);

  doctor.verificationStatus = 'rejected';
  doctor.rejectionReason = reason;
  await doctor.save();

  try {
    await new Email(doctor.user, '').sendDoctorReject();
  } catch (err) {
    console.log(err);
  }

  return { doctor };
};

export const pendingDoctors = async () => {
  return await Doctor.find({ verificationStatus: 'pending' })
    .populate('user', 'name email')
    .sort({ createdAt: 1 });
};
