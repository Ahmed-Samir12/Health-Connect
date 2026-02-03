import Doctor from './doctorModel.js';
import AppError from '../../utils/AppError.js';

const filter = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const allowedFields = [
  'bio',
  'experienceYears',
  'consultationFee',
  'specialization',
  'licenseNumber',
  'documents',
  'availableSlots',
];

const sensetiveFields = [
  'specialization',
  'licenseNumber',
  'documents',
  'availableSlots',
];

/**
 * Convert time string to minutes for comparison
 * @param {string} time - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Validate availability slots
 * @param {Array} availableSlots - array of day schedule
 * @returns {AppError} if validation fails
 */

export const validateAvailability = (availableSlots) => {
  if (!availableSlots || availableSlots.length === 0)
    throw new AppError('Doctor must have at least one available day', 400);

  const seenDays = new Set();

  availableSlots.forEach((daySchedule) => {
    const { day, slots } = daySchedule;

    // check for duplicate days
    if (seenDays.has(day))
      throw new AppError(`Duplicate day found ${day}`, 400);

    seenDays.add(day);

    // validate slots
    if (!slots || slots.length === 0)
      throw new AppError(`${day} must have at least one time slot`, 400);

    slots.forEach((slot) => {
      const startTime = timeToMinutes(slot.startTime);
      const endTime = timeToMinutes(slot.endTime);

      if (startTime >= endTime)
        throw new AppError(
          `Invalid slot on ${day}!, start time (${slot.startTime}) must be before end time (${slot.endTime})`,
          400,
        );

      // minimum slot duration 15 min
      if (endTime - startTime < 15)
        throw new AppError(
          `slot on ${day} must be at least 15 minutes long`,
          400,
        );

      // maximum slot duration 1 hour
      if (endTime - startTime < 60)
        throw new AppError(`slot on ${day} cannot exceed 1 hour`, 400);
    });

    // check for overlapping slots
    const sortedSlots = [...slots].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    for (let i = 1; i < sortedSlots.length; i++) {
      const prevEnd = timeToMinutes(sortedSlots[i - 1].endTime);
      const currStart = timeToMinutes(sortedSlots[i].startTime);

      if (currStart < prevEnd)
        throw new AppError(
          `overlapping slot on ${day}: ${sortedSlots[i - 1].startTime}-${sortedSlots[i - 1].endTime} and ${sortedSlots[i].startTime}-${sortedSlots[i].endTime}`,
          400,
        );
    }
  });

  return true;
};

/**
 * Validate Doctor for approval
 * @param {object} doctor - doctor document
 * @returns {AppError} if validation fails
 */

export const validateDoctorForApproval = (doctor) => {
  if (doctor.verificationStatus === 'approved')
    throw new AppError('Doctor is already approved', 400);

  if (doctor.experienceYears < 2)
    throw new AppError('You must have at least 2 years of experience', 400);

  if (doctor.consultationFee < 10 || doctor.consultationFee > 500)
    throw new AppError('Consultation fee must be between 10 and 500', 400);

  return true;
};

export const createDoctorProfile = async (data) => {
  const filteredBody = filter(data.body, ...allowedFields);

  if (filteredBody.availableSlots)
    throw new AppError('Only verified doctors can set availability');

  const doctor = await Doctor.create({
    user: data.user.id,
    ...filteredBody,
    verificationStatus: 'pending',
  });

  return { doctor };
};

export const updateDoctorProfile = async (userId, updatedData) => {
  // 1) fetch doctor
  const doctor = await Doctor.findOne({ user: userId });

  if (!doctor) throw new AppError('Doctor not found', 404);

  // 2) admin only fields
  if (updatedData.verificationStatus)
    throw new AppError('You are not allowed to perform this action!', 403);

  // 3) filter allowed fields only
  const filteredBody = filter(updatedData, ...allowedFields);

  // 4) validate availableSlots
  if (filteredBody.availableSlots)
    validateAvailability(filteredBody.availableSlots);

  // 5) check if sensetive fields changed
  const requiredReverification = sensetiveFields.some(
    (field) => field in filteredBody,
  );

  // 6) apply update
  Object.assign(doctor, filteredBody);

  if (requiredReverification) doctor.verificationStatus = 'pending';

  await doctor.save({ validateBeforeSave: false });

  return {
    doctor,
    requiredReverification,
    message: requiredReverification
      ? 'Profile updated. Admin verification required.'
      : 'Profile updated successfully.',
  };
};
