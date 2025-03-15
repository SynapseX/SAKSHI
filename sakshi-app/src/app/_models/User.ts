export interface User {
    uid: string;
    accessToken?: string;
    photoURL: string | null;
    displayName: string | null;
    email: string | null;
}

export interface TokenProps {
    nameid: string;
    unique_name: string;
    role: string | string[];
    nbf: number;
    exp: number;
    iat: number;
}
