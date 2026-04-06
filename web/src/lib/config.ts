import { IConfig } from "@/types";

const config: IConfig = {
  appEnv: process.env.NEXT_PUBLIC_APP_ENV as
    | "dev"
    | "staging"
    | "prod",
  nodeEnv: process.env.NODE_ENV as "dev" | "prod" | "test",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "GrowTeens",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",

  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "",

  email: {
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT as string, 10),
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
};

export default config;
