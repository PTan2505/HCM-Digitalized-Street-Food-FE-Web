export interface User {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: number;
  point?: number;
  createdAt?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  userInfoSetup?: boolean;
}
