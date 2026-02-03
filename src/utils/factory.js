import AppError from './AppError.js';
import ApiFeatures from './ApiFeatures.js';

export const createOne = (Model) => async (req, res) => {
  const doc = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { doc },
  });
};

export const getAll = (Model) => async (req, res) => {
  const features = new ApiFeatures(Model.find(req.visability || {}), req.query)
    .filter()
    .limitFields()
    .paginate()
    .sort()
    .search(['specialization']);

  const doc = await features.query;

  res.status(201).json({
    status: 'success',
    result: doc.length,
    data: { doc },
  });
};

export const getOne = (Model, populateOptions) => async (req, res) => {
  let query = Model.findById(req.params.id);

  if (populateOptions) query = query.populate(populateOptions);

  const doc = await query;

  if (!doc) throw new AppError('No document found with this id', 404);

  res.status(201).json({
    status: 'success',
    data: { doc },
  });
};

export const updateOne = (Model) => async (req, res) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!doc) throw new AppError('No document found with this id', 404);

  res.status(201).json({
    status: 'success',
    data: { doc },
  });
};

export const deleteOne = (Model) => async (req, res) => {
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) throw new AppError('No document found with this id', 404);

  res.status(201).json({
    status: 'success',
  });
};
