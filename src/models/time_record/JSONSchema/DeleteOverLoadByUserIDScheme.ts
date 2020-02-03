import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const DeleteOverLoadByUserIDScheme: IJSONSchemaType = {
  description: '특정 사용자의 특정 주간 정산 기록을 삭제한다.',
  properties: {
    body: {
      properties: {
        user_id: {
          type: 'string'
        },
        auth_user_id: {
          type: 'string'
        },
        week: {
          type: 'string',
          pattern: '^([0-9]{4})-?W(5[0-3]|[1-4][0-9]|0[1-9])$'
        }
      },
      required: ['user_id', 'auth_user_id', 'week']
    }
  },
  required: ['body']
};
