export interface EmailConfig {
  host: string | undefined;
  port: number | undefined;
  user: string | undefined;
  pass: string | undefined;
  from: string | undefined;
}

export interface IConfig {
  appEnv: "dev" | "staging" | "prod" | "sandbox";
  nodeEnv: "dev" | "prod" | "test";
  appName: string;
  appUrl: string;
  apiBaseUrl: string;
  nextAuthSecret: string;
  email: EmailConfig;
}
