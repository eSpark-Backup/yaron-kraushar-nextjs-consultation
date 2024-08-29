export interface UserSettings {

    keySize: string;
    textSize: string;
}

export const DefaultUserSettings: UserSettings =
{
    keySize: "small",
    textSize: "small",
}


export interface User {
  authorized: boolean;
  _id: string | null;
  userId: string | null;
  stripe_customer_id: string | null;
  fullName: string | null;
  email: string | null;
  password: string | null;
  IP: string | null;
  isEmulator: string | null;
  userLanguageCode: string | null;
  userVoice: string | null;
  settings: UserSettings | null;
  registeredAt: Date | null;
  userAddress: UserAddress | null;

  
  // New fields
  stripe_link: stripe_link | null;
  cancel_at_period_end: boolean | null;
  current_period_end: Date | null;
  current_period_start: Date | null;
  subscription_id: string | null;
  subscription_status: string | null;
  trial_end: Date | null;
}



export interface UserAddress {
  country: string;
  postCode: string;
  countryCode: string;
}

export interface stripe_link {
  UUID: string | null;
  expires: Date | null;
}