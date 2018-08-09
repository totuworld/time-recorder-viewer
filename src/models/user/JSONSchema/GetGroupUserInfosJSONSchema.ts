import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const GetGroupUserInfosJSONSchema: IJSONSchemaType = {
  description: '그룹의 사용자 정보 전체를 로딩한다.',
  properties: {
    query: {
      properties: {
        groupId: {
          type: 'string',
        },
      },
      required: ['groupId'],
    }
  },
  required: ['query'],
};
