import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from 'bcrypt';
import prismadb from '@/lib/prismadb';

import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { PrismaAdapter } from "@next-auth/prisma-adapter";

export default NextAuth ({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || '', 
            clientSecret: process.env.GITHUB_SECRET || '',
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '', 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                },
            },
            async authorize(credentials) {
                console.log('Authorizing user with credentials...');
                console.log(credentials);
                
            
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }
            
                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
            
                console.log('Found user:');
                console.log(user);
            
                if (!user || !user.hashedPassword) {
                    throw new Error('Invalid email or password');
                }
            
                const isCorrectPassword = await compare(credentials.password, user.hashedPassword);
            
                if (!isCorrectPassword) {
                    throw new Error('Invalid email or password');
                }
            
                return user;
            }
            
        })
    ],
    pages: {
        signIn: '/auth'
    },
    debug: process.env.NODE_ENV === 'development',
    adapter: PrismaAdapter(prismadb),
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
})