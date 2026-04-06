export type AccessToken = {
    token: string;
    tokenType: 'bearer',
    expiresAt: string;
}

export interface ResponseDto<T> {
    status: 'success' | 'error';
    message: string;
    data?: T;
    accessToken?: AccessToken;
}