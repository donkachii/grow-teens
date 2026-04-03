import { HttpException } from "./root.ts";

export class BadRequestException extends HttpException {
  constructor(message: string, errorCode: number) {
    super(400, message, errorCode, null);
  }
}
