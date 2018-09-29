import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const GetHolidyasJSONSchema: IJSONSchemaType = {
  description: '공휴일 조회',
  properties: {
    query: {
      properties: {
        start_date: {
          type: 'string',
          format: 'date',
        },
        end_date: {
          type: 'string',
          format: 'date',
        }
      },
      required: ['start_date', 'end_date'],
    }
  },
  required: ['query'],
};
