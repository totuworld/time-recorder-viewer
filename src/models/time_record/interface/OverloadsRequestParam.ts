export interface OverloadsRequestParam {
  query: {
    auth_user_id: string;
  };
}

export interface OverloadsByUserIDRequestParam {
  query: {
    user_id: string;
  };
}

export interface OverLoadByUserIDWithDateRequestParam {
  target_date: string;
}

export interface OverLoadByUserIDWithDateQueryRequestParam {
  query: {
    user_id: string;
  };
}

export interface DeleteOverloadByUserIDRequestParam {
  body: {
    week: string;
    auth_user_id: string;
    user_id: string;
  };
}
