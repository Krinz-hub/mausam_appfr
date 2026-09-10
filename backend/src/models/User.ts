import mongoose, { Schema, Document } from 'mongoose';
import { IUserDocument } from './types.js';

export interface IUserModel extends Omit<IUserDocument, '_id'>, Document {}

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
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    displayName: {
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
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUserModel>('User', UserSchema);
