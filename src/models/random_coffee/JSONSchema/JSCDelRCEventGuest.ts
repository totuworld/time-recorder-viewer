import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCDelRCEventGuest: IJSONSchemaType = {
  properties: {
    params: {
      properties: {
        eventId: {
          type: 'string'
        },
        docId: {
          type: 'string'
        }
      },
      required: ['eventId', 'docId']
    }
  },
  required: ['params']
};
