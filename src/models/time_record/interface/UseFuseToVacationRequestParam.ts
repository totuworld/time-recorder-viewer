export interface UseFuseToVacationRequestParam {
  body: {
    auth_user_id: string;
    user_id: string;
    /** 해당 휴가를 등록한 날짜 */
    target_date: string;
  };
}
