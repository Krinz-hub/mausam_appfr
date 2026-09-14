import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from './types.js';

export interface IUserModel extends Omit<IUserDocument, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserTypeScoreSchema = new Schema(
  {
    type: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const SavedLocationSchema = new Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isPrecise: { type: Boolean, default: false },
    city: { type: String },
    region: { type: String },
    country: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password hash in API responses
    },
    displayName: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    photoURL: {
      type: String,
      default: '',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    profile: {
      userTypes: { type: [UserTypeScoreSchema], default: [] },
      interests: { type: [String], default: [] },
      activities: { type: [String], default: [] },
    },
    preferences: {
      temperatureUnit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius',
      },
      notificationsEnabled: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      reducedMotion: { type: Boolean, default: false },
      rainAlerts: { type: Boolean, default: true },
      severeWeatherAlerts: { type: Boolean, default: true },
    },
    personalization: {
      needProfile: { type: Schema.Types.Mixed, default: null },
      personaProfile: { type: Schema.Types.Mixed, default: null },
    },
    savedLocations: {
      type: [SavedLocationSchema],
      default: [],
    },
    learning: {
      feedbackHistory: { type: Schema.Types.Mixed, default: {} },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        return ret;
      },
    },
  }
);

// Pre-save hook to hash password before saving to MongoDB
UserSchema.pre('save', async function () {
  if (!this.displayName) {
    this.displayName = this.name;
  }
  if (!this.photoURL && this.avatar) {
    this.photoURL = this.avatar;
  }

  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Method to verify password on login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUserModel>('User', UserSchema);
