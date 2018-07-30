import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const GetTimeRecordsJSONSchema: IJSONSchemaType = {
  description: '개인의 time record 기록을 조회할 때 사용',
  properties: {
    query: {
      properties: {
        userId: {
          type: 'string',
        },
        startDate: {
          type: 'string',
          format: 'date',
        },
        endDate: {
          type: 'string',
          format: 'date',
        }
      },
      required: ['userId'],
    }
  },
  required: ['query'],
};
