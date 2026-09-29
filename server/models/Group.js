import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      default: '',
      maxlength: 250,
    },
    image: {
      type: String,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    settings: {
      allowMemberRoomCreation: {
        type: Boolean,
        default: true,
      },
      allowMemberInvites: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ ownerId: 1 });

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
export default Group;
