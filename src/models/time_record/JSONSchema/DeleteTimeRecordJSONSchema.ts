import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const DeleteTimeRecordJSONSchema: IJSONSchemaType = {
  description: '사용자 기록을 삭제한다.',
  properties: {
    body: {
      properties: {
        user_id: {
          type: 'string'
        },
        auth_user_id: {
          type: 'string'
        },
        target_date: {
          type: 'string',
          pattern: '^[0-9]{4}(0|1)[0-9](0|1|2|3)[0-9]'
        },
        log_id: {
          type: 'string',
        }
      },
      required: ['user_id', 'auth_user_id', 'target_date', 'log_id']
    }
  },
  required: ['body']
};
