import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const PostTimeRecordJSONSchema: IJSONSchemaType = {
  description: '사용자 기록을 추가한다.',
  properties: {
    body: {
      properties: {
        user_id: {
          type: 'string',
        },
        auth_user_id: {
          type: 'string',
        },
        type: {
          type: 'string',
          enum: ['WORK', 'BYEBYE', 'REST', 'EMERGENCY', 'DONE', 'REMOTE', 'REMOTEDONE', 'VACATION', 'HALFVACATION']
        },
        target_date: {
          type: 'string',
          pattern: '^[0-9]{4}(0|1)[0-9](0|1|2|3)[0-9]'
        },
        time: {
          type: 'string',
          format: 'date-time',
        }
      },
      required: ['user_id', 'auth_user_id', 'type'],
    }
  },
  required: ['body'],
};
