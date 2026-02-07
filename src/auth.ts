export const runtime = "nodejs";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [

        //google login

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ,
        }),

        //credentials login

        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
            identifier: {
                label: "Email or Username",
                type: "text",
            },
            password: {
                label: "Password",
                type: "password",
            },
            },
            
            async authorize(credentials:any): Promise<any> {
                if (!credentials?.identifier || !credentials?.password) {
                return null;
                }
            
                await dbConnect();
            
                const user = await UserModel.findOne({
                $or: [
                    { email: credentials.identifier },
                    { username: credentials.identifier },
                ],
                });
            
                if (!user) {
                    throw new Error("No user found with the given identifier");
                }
            
                if (!user.isVerified) {
                    throw new Error("User is not verified. Please verify your email.");
                }
            
                const isPasswordCorrect = await bcrypt.compare(
                String(credentials.password),
                user.password
                );
            
                if (!isPasswordCorrect) {
                    throw new Error("Invalid password");
                }
            
                return {
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
                };
            }
    
        })
    ],
    session: {
        strategy: "jwt",
    },
    
    callbacks: {
        async jwt({ token, user, account }) {

        // credentials login

        if (user) {
            token.id = user.id;
            token.username = user.username;
            token.isVerified = user.isVerified;
        }
    
        return token;
        },
    
        async session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            session.user.username = token.username as string;
            session.user.isVerified = token.isVerified as boolean;
        }
        return session;
        },
    },
    
    pages: {
        signIn: "/sign-in",
    },
    
    secret: process.env.AUTH_SECRET,
    });
