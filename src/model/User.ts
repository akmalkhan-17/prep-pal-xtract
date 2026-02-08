import mongoose, { Schema, Document, Types } from "mongoose";


//for interview

export interface Interview  {
    _id?: Types.ObjectId;
    interviewType: "role" | "resume"
    role?: string
    resumeText?: string

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
        default: null
    },
    resumeText: {
        type: String,
        default: null
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
    }
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
    interviews: Interview[];
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
