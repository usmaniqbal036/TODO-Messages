import mongoose from 'mongoose';

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'A message cannot exceed 1000 characters'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


MessageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });



export default mongoose.model('Message', MessageSchema);
