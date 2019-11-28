import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCFindAllFuseToVacation: IJSONSchemaType = {
  description: '초과 근무로 만든 휴가 목록 조회',
  properties: {
    params: {
      properties: {
        user_id: {
          type: 'string'
        }
      },
      required: ['user_id']
    }
  },
  required: ['params']
};
