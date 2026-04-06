/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import requestClient from "@/lib/requestClient";
import config from "@/lib/config";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || config.nextAuthSecret,
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60, // 1hour,
  },
  jwt: {
    maxAge: 60 * 60, // 1hour,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const response = await requestClient().post("/auth/signin", {
            email: credentials.email,
            password: credentials.password,
          });

          const { user, accessToken } = response.data;

          return {
            id: user.id,
            firstName: user.firstName,
            email: user.email,
            lastName: user.lastName,
            role: user.role,
            age: user?.age,
            enrollments: user?.enrollments,
            token: accessToken,
          };
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message);
          } else {
            console.error("An unknown error occurred");
          }
          const errorMessage =
            (error as any).response?.data?.message ??
            "Authentication failed. Please try again.";

          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.age = user?.age;
        token.enrollments = user?.enrollments;
        token.token = user?.token;
      }
      return token;
    },
    async session({ session, token }: { token: any; session: any }) {
      if (token) {
        session.user = { ...token };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: `/auth/signin`,
    signOut: `/auth/logout`,
  },
};
