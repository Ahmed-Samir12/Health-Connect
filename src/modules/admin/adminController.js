import * as adminServices from './adminServices.js';

export const verifiyDoctor = async (req, res) => {
  const { doctor } = await adminServices.approveDoctor(req.params.doctorId);

  res.status(200).json({
    status: 'success',
    message: 'Doctor verified successfully',
    data: {
      doctor: {
        id: doctor._id,
        name: doctor.user.name,
        specialization: doctor.specialization,
      },
    },
  });
};

export const rejectDoctor = async (req, res) => {
  const { doctor } = await adminServices.rejectDoctor(
    req.params.doctorId,
    req.body.reason,
  );

  res.status(200).json({
    status: 'success',
    message: 'Doctor application rejected',
    data: {
      doctor: {
        id: doctor._id,
        name: doctor.user.name,
        rejectionReason: doctor.rejectionReason,
      },
    },
  });
};

export const getPendingDoctors = async (req, res) => {
  const doctors = await adminServices.pendingDoctors();

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    data: { doctors },
  });
};
