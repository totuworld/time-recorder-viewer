export interface IUserItem {
  id: string;
  name: string;
  real_name: string;
}

export interface IUserInfo extends IUserItem {
  profile_url: string;
}

export interface ISlackUserInfo extends IUserInfo {
  auth_id?: string;
}
