// message, status code, error code, error

export class HttpException extends Error {
  statusCode: number;
  errorCode: number;
  error: unknown;

  constructor(statusCode: number, message: string, errorCode: number, error: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.error = error;
  }
}

export const ErrorCodes = {
  USER_NOT_FOUND: 1001,
  USER_ALREADY_EXISTS: 1002,
  INCORRECT_PASSWORD: 1003,
};
