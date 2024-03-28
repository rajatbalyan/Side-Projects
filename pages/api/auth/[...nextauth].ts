import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import { compare } from 'bcrypt';
import * as bcrypt from 'bcrypt';
import prismadb from '@/lib/prismadb';
// import { log } from "console";

export default NextAuth ({
    providers: [
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

                if(!credentials?.email || credentials?.password){
                    throw new Error('Email and password required');
                }

                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                console.log('Found user:');
                console.log(user);

                if(!user || !user.hashedPassword) {
                    throw new Error('Email does not exist')
                }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.hashedPassword);

                console.log('Password is correct:', isPasswordCorrect);

                if(!isPasswordCorrect){
                    throw new Error('Incorrect Password');
                }

                return user;
            }
        })
    ],
    pages: {
        signIn: '/auth'
    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
})