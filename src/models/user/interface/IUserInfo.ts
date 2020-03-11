export interface IUserItem {
  id: string;
  name: string;
  real_name: string;
  /** 매너지 권한이 있는지 확인하는 필드 */
  manager?: boolean;
}

export interface IUserInfo extends IUserItem {
  profile_url: string;
  userUid?: string;
}

export interface ISlackUserInfo extends IUserInfo {
  auth_id?: string;
}
