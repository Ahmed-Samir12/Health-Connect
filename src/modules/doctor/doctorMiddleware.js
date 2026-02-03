import AppError from '../../utils/AppError.js';

export const requireDoctorRole = (req, res, next) => {
  if (req.user.role !== 'doctor')
    throw new AppError('Only doctors allowed!', 403);

  next();
};

export const filterDoctorVisability = (req, res, next) => {
  const user = req.user;

  // if public user or patient ==> get verified doctors
  if (!user || user.role === 'patient') {
    req.visability = { verificationStatus: 'approved' };
    return next();
  }

  // if admin ==> get all doctors
  if (user.role === 'admin') {
    req.visability = {};
    return next();
  }

  if (user.role === 'doctor') {
    req.visability = {
      $or: [{ user: user.id }, { verificationStatus: 'approved' }],
    };
    return next();
  }
};
