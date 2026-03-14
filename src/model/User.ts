import mongoose, { Schema, Document, Types } from "mongoose";
import {
    INTERVIEW_ROLES,
    INTERVIEW_STATUSES,
    MAX_INTERVIEW_QUESTIONS,
    QUESTION_DIFFICULTIES,
    type InterviewRole,
    type InterviewStatus,
    type QuestionDifficulty,
} from "@/lib/interview-config";

export interface InterviewQuestion {
    _id?: Types.ObjectId;   
    question: string;
    order: number;
    difficulty: QuestionDifficulty;
    answer?: string | null;
    feedback?: string | null;
    technicalScore?: number | null;
    communicationScore?: number | null;
}

export interface VideoMetrics {
    faceVisibility: number;
    postureScore: number;
    gazeScore: number;
    engagementScore: number;
    totalFrames: number;
    framesWithFace: number;
}

export interface Interview  {
    _id?: Types.ObjectId;
    interviewType: "role" | "resume"
    role?: InterviewRole | null
    resumeText?: string | null

    questions?: InterviewQuestion[];
    status: InterviewStatus;
    totalQuestions: number;
    videoMetrics?: VideoMetrics | null;

    softSkillsScore: number
    technicalSkillsScore: number
    overallScore: number
    
    createdAt: Date
}

const InterviewSchema: Schema<Interview> = new Schema({
    interviewType: {
        type: String,
        enum: ["role", "resume"],
        required: true
    },
    role: {
        type: String,
        enum: INTERVIEW_ROLES,
        default: null
    },
    resumeText: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: INTERVIEW_STATUSES,
        default: "in_progress",
        required: true
    },
    totalQuestions: {
        type: Number,
        default: MAX_INTERVIEW_QUESTIONS,
        required: true
    },
    videoMetrics: {
        type: {
            faceVisibility: { type: Number, default: 0 },
            postureScore: { type: Number, default: 0 },
            gazeScore: { type: Number, default: 0 },
            engagementScore: { type: Number, default: 0 },
            totalFrames: { type: Number, default: 0 },
            framesWithFace: { type: Number, default: 0 },
        },
        default: null,
    },
    softSkillsScore:{
        type: Number,
        required: true
    },
    technicalSkillsScore:{
        type: Number,
        required: true
    },
    overallScore:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    questions: {
        type: [
            {
                question: { type: String, required: true },
                order: { type: Number, required: true },
                difficulty: {
                    type: String,
                    enum: QUESTION_DIFFICULTIES,
                    required: true
                },
                answer: { type: String, default: null },
                feedback: { type: String, default: null },
                technicalScore: { type: Number, default: null },
                communicationScore: { type: Number, default: null },
            }
        ],
        default: [],
    },
},

);

//User Schema


export interface User extends Document {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    interviews: Types.DocumentArray<Interview>;
}

const UserSchema: Schema<User> = new Schema({
    username:{
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true
    }
    ,
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [ /^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email address"]
    },
    password:{
        type: String,
        required: [true, "Password is required"],
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    verifyCode:{
        type: String,
        required: [true, "Verification code is required"]
    },
    verifyCodeExpiry:{
        type: Date,
        required: [true, "Verification code expiry date is required"]
    },
    interviews:{
        type: [InterviewSchema]
    }
})

const UserModel =
    (mongoose.models.User as mongoose.Model<User>) ||
    mongoose.model<User>("User", UserSchema);

export default UserModel;
