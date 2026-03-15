export const runtime = "nodejs";

import NextAuth from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

type CredentialsInput = {
    identifier: string;
    password: string;
};

type AuthUser = NextAuthUser & {
    id: string;
    username: string;
    isVerified: boolean;
};

function normalizeUsernameSeed(value: string) {
    const normalized = value
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");

    return normalized.length >= 3 ? normalized.slice(0, 24) : `user_${normalized || "account"}`;
}

async function createUniqueUsername(seed: string) {
    const base = normalizeUsernameSeed(seed);
    let candidate = base;
    let counter = 1;

    while (await UserModel.exists({ username: candidate })) {
        candidate = `${base.slice(0, 20)}_${counter}`;
        counter += 1;
    }

    return candidate;
}

async function ensureGoogleUser(params: {
    email?: string | null;
    name?: string | null;
}) {
    if (!params.email) {
        throw new Error("Google account email is required");
    }

    await dbConnect();

    const existingUser = await UserModel.findOne({ email: params.email });

    if (existingUser) {
        if (!existingUser.interviews) {
            existingUser.set("interviews", []);
            await existingUser.save();
        }

        return existingUser;
    }

    const username = await createUniqueUsername(
        params.name || params.email.split("@")[0] || "google_user"
    );

    const hashedPassword = await bcrypt.hash(randomUUID(), 10);
    const googleUser = await UserModel.create({
        username,
        email: params.email,
        password: hashedPassword,
        isVerified: true,
        verifyCode: "google-auth",
        verifyCodeExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        interviews: [],
    });

    return googleUser;
}

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
            
            async authorize(credentials): Promise<AuthUser | null> {
                const parsedCredentials = credentials as CredentialsInput | undefined;

                if (!parsedCredentials?.identifier || !parsedCredentials?.password) {
                return null;
                }
            
                await dbConnect();
            
                const user = await UserModel.findOne({
                $or: [
                    { email: parsedCredentials.identifier },
                    { username: parsedCredentials.identifier },
                ],
                });
            
                if (!user) {
                    throw new Error("No user found with the given identifier");
                }
            
                if (!user.isVerified) {
                    throw new Error("User is not verified. Please verify your email.");
                }
            
                const isPasswordCorrect = await bcrypt.compare(
                String(parsedCredentials.password),
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
        async jwt({ token, user }) {
        if ((user || token.email) && !token.id) {
            const dbUser = await ensureGoogleUser({
                email: user?.email || token.email,
                name: user?.name || token.name,
            });

            token.id = dbUser._id.toString();
            token.username = dbUser.username;
            token.isVerified = dbUser.isVerified;
            token.email = dbUser.email;
        }

        // credentials login

        if (user) {
            const authUser = user as AuthUser;

            token.id = authUser.id;
            token.username = authUser.username;
            token.isVerified = authUser.isVerified;
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
