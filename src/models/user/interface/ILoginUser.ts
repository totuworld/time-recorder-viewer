export interface ILoginUser {
  result: boolean;
  data?: ILoginUserInfo;
}

export interface ILoginUserInfo {
  email: string;
  id: string;
  auth: number | null;
  user_uid?: string;
}
