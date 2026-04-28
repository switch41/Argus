export type Role = 'admin' | 'tourist' | 'police' | 'tourism_official' | 'responder' | 'operator';

export interface UserProfile {
    id: string;
    name: string;
    role: Role;
    department?: string;
    created_at: string;
}
