import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const PostTimeRecordJSONSchema: IJSONSchemaType = {
  description: '사용자 기록을 추가한다.',
  properties: {
    body: {
      properties: {
        user_id: {
          type: 'string',
        },
        text: {
          type: 'string',
        }
      },
      required: ['user_id', 'text'],
    }
  },
  required: ['body'],
};
