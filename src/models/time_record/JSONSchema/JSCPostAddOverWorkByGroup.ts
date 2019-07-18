import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCPostAddOverWorkByGroup: IJSONSchemaType = {
  description:
    '특정 그룹(group_id)의 특정 주(week)초과 근무를 정산한다(단, 출근 로그가 있는 사용자만)',
  properties: {
    body: {
      properties: {
        group_id: {
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
      required: ['group_id', 'manager_id', 'week']
    }
  },
  required: ['body']
};
