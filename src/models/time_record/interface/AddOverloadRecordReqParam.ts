export interface AddOverloadRecordReqParam {
  body: {
    /** 대상 사용자 */
    user_id: string;
    /** 정상할 주(ISO 8601) ex: 2019-W22 */
    week: string;
    /** 정산 명령을 내린 사용자 */
    manager_id: string;
  };
}

export interface AddOverloadRecordByGroupReqParam {
  body: {
    /** group_id */
    group_id: string;
    /** 정상할 주(ISO 8601) ex: 2019-W22 */
    week: string;
    /** 정산 명령을 내린 사용자 */
    manager_id: string;
  };
}
