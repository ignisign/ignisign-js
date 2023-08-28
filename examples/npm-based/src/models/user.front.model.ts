import { COUNTRIES } from "@ignisign/public";

export type MyUser = {
  firstName     : string;
  lastName      : string;
  email         : string;
  nationality   : COUNTRIES;
  birthDate     : Date;
  birthPlace    : string;
  birthCountry  : COUNTRIES;
  signerId     ?: string;
  authSecret   ?: string;
  phoneNumber  ?: string;
  _id          ?: string;
}