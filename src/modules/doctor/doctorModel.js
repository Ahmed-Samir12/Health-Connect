import mongoose from 'mongoose';

const { Schema } = mongoose;

const timeSlotSchema = new Schema(
  {
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format. Use HH:MM',
      ],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Invalid time format. Use HH:MM',
      ],
    },
  },
  { _id: false },
);

const availabilitySchema = new Schema(
  {
    day: {
      type: String,
      required: true,
      enum: {
        values: [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        message: '{VALUE} is not a valid day',
      },
    },
    slots: {
      type: [timeSlotSchema],
      validate: {
        validator: function (slots) {
          return slots && slots.length > 0;
        },
        message: 'Each day must have at least one time slot',
      },
    },
  },
  { _id: false },
);

const doctorSchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Doctor must have a specialization'],
      trim: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide license number'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Please provide years of experience'],
      min: 0,
    },
    bio: {
      type: String,
      required: [true, 'Please tell us about yourself'],
      trim: true,
      maxLength: 500,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Provide a consultation fee'],
      min: 0,
    },
    availableSlots: {
      type: [availabilitySchema],
    },
    documents: {
      type: [String],
      // required: [true, 'Provide your license'],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Doctor', doctorSchema);
