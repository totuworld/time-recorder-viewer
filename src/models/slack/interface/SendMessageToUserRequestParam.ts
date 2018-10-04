export interface SendMessageToUserRequestParam {
  query: {
    token?: string;
    channel: string;
    text: string;
    icon_url?: string;
  };
}