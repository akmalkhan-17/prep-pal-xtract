import dbConnect from "@/lib/dbConnect";

import UserModel from "@/model/User";

import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
await dbConnect();
try {
    const {username, email, password} = await request.json()

    // Check if user aaya bhi ki ni 

    if(!username || !email || !password){
        return Response.json(
            { success: false, message: "All fields are required" },
            { status: 400 }
    )
}

    // ab check krlo ki username already exist krta ki ni 

    const existingUserVerifyByUsername =await UserModel.findOne({ 
        username,
        isVerified: true
    })

    if( existingUserVerifyByUsername){
        return Response.json(
            {
                success: false,
                message: "Username is already taken.",
            },
            { status: 400 }
        )
    }
    // ab check krlo ki email already exist krta ki ni

    const existingUserVerifyByEmail = await UserModel.findOne({ 
        email 
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);
    
    if (existingUserVerifyByEmail) {
    if (existingUserVerifyByEmail.isVerified) {
        return Response.json(
        {
            success: false,
            message: "Email is already registered.",
        },
        { status: 400 }
        );
    } else {

        // agar user exist krta hai but verified ni hai toh uska password update krdo, verify code update krdo and expiry date update krdo
    
        existingUserVerifyByEmail.username = username;
        existingUserVerifyByEmail.password = hashedPassword;
        existingUserVerifyByEmail.verifyCode = verifyCode;
        existingUserVerifyByEmail.verifyCodeExpiry = verifyCodeExpiry;
    
        await existingUserVerifyByEmail.save();
    }
    } else {
        
    // new user create krdo
    
    const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: verifyCodeExpiry,
        isVerified: false,
        interviews: [], 

    });
    
    await newUser.save();
    }

    // send verification email

    const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
    );
    
    if (!emailResponse.success) {
        return Response.json(
        {
            success: false,
            message: emailResponse.message,
        },
        { status: 500 }
        );
    }
    
    return Response.json(
        {
        success: true,
        message: "User registered successfully. Verification email sent.",
        },
        { status: 201 }
    );

    
        
    } catch (error) {
        console.error("Error registering user", error);
        return Response.json(
            {
                success: false,
                message: "Internal server error during registration.",
            },
            { status: 500 }
        )
    }
    }