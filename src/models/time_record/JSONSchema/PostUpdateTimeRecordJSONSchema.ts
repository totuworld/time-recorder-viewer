import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const PostUpdateTimeRecordJSONSchema: IJSONSchemaType = {
  description: '사용자 기록을 수정한다.',
  properties: {
    body: {
      properties: {
        auth_user_id: { type: 'string', },
        user_id: { type: 'string', },
        update_date: { type: 'string', },
        record_key: { type: 'string', },
        target_key: { type: 'string', enum: ['refKey', 'time', 'done', 'type'], default: 'time' },
        time: { type: 'string', format: 'date-time'},
      },
      required: ['auth_user_id', 'user_id', 'update_date', 'record_key', 'target_key', 'time'],
    }
  },
  required: ['body'],
};
