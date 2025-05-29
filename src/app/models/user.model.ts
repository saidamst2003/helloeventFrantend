export enum UserRole {
    ADMIN = 'ADMIN',
    CLIENT = 'CLIENT'
}

export interface User {
    id?: number;
    username: string;
    email: string;
    password: string;
    role: UserRole;
} 