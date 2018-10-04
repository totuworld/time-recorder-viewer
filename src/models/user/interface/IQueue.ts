export interface IQueue {
  /** 생성 일시 */
  created: string;
  /** 사용자 slack 명 */
  real_name: string;
  /** 사용자 slack id */
  slack_id: string;
  /** 주요 정보 */
  id: string;
}