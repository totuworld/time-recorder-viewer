import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const GetOverloadsJSONSchema: IJSONSchemaType = {
  description: '개인의 추가근무 기록을 조회할 때 사용',
  properties: {
    query: {
      properties: {
        auth_user_id: {
          type: 'string',
        },
      },
      required: ['auth_user_id'],
    }
  },
  required: ['query'],
};

export const GetOverloadsByUserIDJSONSchema: IJSONSchemaType = {
  description: '개인의 추가근무 기록을 조회할 때 사용',
  properties: {
    query: {
      properties: {
        user_id: {
          type: 'string',
        },
      },
      required: ['user_id'],
    }
  },
  required: ['query'],
};

export const GetOverloadByUserIDWithDateJSONSchema: IJSONSchemaType = {
  description: '개인의 추가근무 기록 조회할 때 사용',
  properties: {
    query: {
      properties: {
        user_id: {
          type: 'string',
        },
      },
      required: ['user_id'],
    },
    target_date: {
      type: 'string',
      format: 'date'
    }
  },
  required: ['query', 'target_date'],
};
