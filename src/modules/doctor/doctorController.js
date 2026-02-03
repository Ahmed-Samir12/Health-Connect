import Doctor from './doctorModel.js';
import * as doctorServices from './doctorServices.js';
import * as factory from '../../utils/factory.js';

export const createDoctor = async (req, res) => {
  const { doctor } = await doctorServices.createDoctorProfile(req);

  res.status(201).json({
    status: 'success',
    data: { doctor },
  });
};

// for updating current doctor data
export const updateMyProfile = async (req, res) => {
  const { doctor, requiredReverification, message } =
    await doctorServices.updateDoctorProfile(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    message,
    data: {
      doctor,
      pendingVerification: requiredReverification,
    },
  });
};

export const getAllDoctors = factory.getAll(Doctor);
export const getDoctor = factory.getOne(Doctor, {
  path: 'user',
  select: 'name email',
});
// admin updating doctor
export const updateDoctor = factory.updateOne(Doctor);
export const deleteDoctor = factory.deleteOne(Doctor);
