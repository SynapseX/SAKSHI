export interface User {
  uid: string;
  accessToken?: string;
  photoURL: string | null;
  displayName: string | null;
  email: string | null;
}

export interface IUserOutput {
  _id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  account_creation_date?: string | null;
  last_login_date?: string | null;
  language?: string;
  time_zone?: string;
}

export class UserOutput {
  _id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  account_creation_date?: string | null;
  last_login_date?: string | null;
  language: string = 'en';
  time_zone: string;

  constructor(data: {
    _id: string;
    name: string;
    email: string;
    phone_number?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    account_creation_date?: string | null;
    last_login_date?: string | null;
    language?: string;
    time_zone?: string;
  }) {
    this._id = data._id;
    this.name = data.name;
    this.email = data.email;
    this.phone_number = data.phone_number;
    this.date_of_birth = data.date_of_birth;
    this.gender = data.gender;
    this.account_creation_date = data.account_creation_date;
    this.last_login_date = data.last_login_date;
    this.language = data.language ?? 'en';
    this.time_zone = data.time_zone ?? new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];
  }
}

export interface TokenProps {
  nameid: string;
  unique_name: string;
  role: string | string[];
  nbf: number;
  exp: number;
  iat: number;
}
