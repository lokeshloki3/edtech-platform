// types/auth.types.ts

export type AccountType = 'Admin' | 'Student' | 'Instructor';

export interface Profile {
  _id: string;
  gender: string | null;
  dateOfBirth: string | null;
  about: string | null;
  contactNumber: number | null;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
  active: boolean;
  approved: boolean;
  image: string;
  additionalDetails: Profile;
  courses: string[];
  courseProgress: string[];
  createdAt: string;
  updatedAt: string;
}
