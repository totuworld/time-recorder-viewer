import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCPutDisableExpiredFuseToVacation: IJSONSchemaType = {
  description: '초과 근무로 만든 휴가를 만료처리한다',
  properties: {
    params: {
      properties: {
        group_id: {
          type: 'string'
        }
      },
      required: ['group_id']
    },
    body: {
      properties: {
        expireDate: {
          type: 'string'
        },
        expireNote: {
          type: 'string'
        },
        auth_id: {
          type: 'string'
        }
      },
      required: ['expireDate', 'expireNote', 'auth_id']
    }
  },
  required: ['params', 'body']
};
