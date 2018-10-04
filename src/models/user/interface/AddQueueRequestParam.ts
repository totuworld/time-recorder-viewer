export interface AddQueueRequestParam {
  userId: string;
}

export interface AddQueueRequestBodyParam {
  body: {
    /** 요청한 사용자(보통 로그인한 사용자) */
    reqUserId: string;
  };
}
