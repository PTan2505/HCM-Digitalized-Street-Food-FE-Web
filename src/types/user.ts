export interface User {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: Date;
  roles: Array<string>;
}
