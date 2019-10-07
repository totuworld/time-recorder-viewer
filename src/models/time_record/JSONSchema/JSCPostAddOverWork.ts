import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCPostAddOverWork: IJSONSchemaType = {
  description: '특정 사용자(user_id)의 특정 주(week)초과 근무를 정산한다',
  properties: {
    body: {
      properties: {
        user_id: {
          type: 'string'
        },
        manager_id: {
          type: 'string'
        },
        week: {
          type: 'string',
          pattern: '^([0-9]{4})-?W(5[0-3]|[1-4][0-9]|0[1-9])$'
        }
      },
      required: ['user_id', 'manager_id', 'week']
    }
  },
  required: ['body']
};
