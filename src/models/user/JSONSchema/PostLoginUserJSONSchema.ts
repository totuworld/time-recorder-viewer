import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const PostLoginUserJSONSchema: IJSONSchemaType = {
  description: '로그인한 사용자 정보를 전달한다.',
  properties: {
    body: {
      properties: {
        userUid: {
          type: 'string',
        },
        email: {
          type: 'string',
          format: 'email',
        }
      },
      required: ['userUid'],
    }
  },
  required: ['body'],
};
