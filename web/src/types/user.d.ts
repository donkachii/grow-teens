/* eslint-disable @typescript-eslint/no-explicit-any */
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserType } from "../constants/enum";

export interface Account {
  providerAccountId: number | string;
  type: "oauth" | "credentials";
  provider: "google" | "credentials";
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  active: boolean;
  status?: number;
  role: UserType;
  createdAt?: string;
  updatedAt?: string;
}

export interface SingleUser {
  user: User & {
    business: Vendor;
  };
}

export interface NextAuthUserSession extends Session {
  user: User & {
    account: Account;
    enrollments: any;
    token?: string;
  };
}

interface NextAuthUserSessionWithToken extends JWT {
  firstName: string;
  lastName: string;
  email: string;
  sub: string;
  id: number;
  role: UserType;
  token: string;
  emailVerified: boolean;
  account: Account;
  iat: number;
  exp: number;
  jti: string;
}

export interface Instructor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
}
