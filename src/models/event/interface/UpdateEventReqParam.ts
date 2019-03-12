export interface UpdateEventReqParam {
  body: {
    title?: string;
    desc?: string;
    private?: boolean;
    last_order?: Date;
    closed?: boolean;
  };
}
