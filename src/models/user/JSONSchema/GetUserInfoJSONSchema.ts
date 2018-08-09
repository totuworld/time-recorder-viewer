import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const GetUserInfoJSONSchema: IJSONSchemaType = {
  description: '사용자 정보를 조회한다.',
  properties: {
    query: {
      properties: {
        userId: {
          type: 'string',
        },
      },
      required: ['userId'],
    }
  },
  required: ['query'],
};
