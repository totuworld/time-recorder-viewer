import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const SendQueueMessageToUserJSONSchema: IJSONSchemaType = {
  description: '저기요 서비스를 사용해서 메시지 보낼 때 사용',
  properties: {
    query: {
      properties: {
        token: {
          type: 'string',
        },
        channel: {
          type: 'string',
        },
        text: {
          type: 'string',
        },
        icon_url: {
          type: 'string',
        },
      },
      required: ['channel', 'text'],
    }
  },
  required: ['query'],
};
