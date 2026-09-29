import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 40,
    },
    description: {
      type: String,
      default: '',
      maxlength: 200,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ groupId: 1, name: 1 }, { unique: true });

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
export default Room;
