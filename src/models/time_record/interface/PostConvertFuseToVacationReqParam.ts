export interface PostConvertFuseToVacationReqParam {
  params: {
    group_id: string;
  };
  body: {
    expireDate: string;
    note: string;
    auth_id: string;
  };
}
