export interface IUserInfo {
  id: string;
  name: string;
  real_name: string;
  profile_url: string;
}

export interface ISlackUserInfo extends IUserInfo {
  auth_id?: string;
}