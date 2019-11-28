import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const UseFuseToVacationJSONSchema: IJSONSchemaType = {
  description: '초과 근무로 만든 휴가를 사용한다.',
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
        }
      },
      required: ['user_id', 'auth_user_id', 'target_date']
    }
  },
  required: ['body']
};
