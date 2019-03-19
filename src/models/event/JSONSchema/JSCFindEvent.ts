import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCFindEvent: IJSONSchemaType = {
  properties: {
    params: {
      properties: {
        event_id: {
          type: 'string'
        }
      },
      required: ['event_id']
    }
  },
  required: ['params']
};
