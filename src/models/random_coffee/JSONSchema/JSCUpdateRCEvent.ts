import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCUpdateRCEvent: IJSONSchemaType = {
  properties: {
    body: {
      properties: {
        desc: {
          type: 'string'
        },
        last_register: {
          format: 'date-time',
          type: 'string'
        },
        private: {
          type: 'boolean'
        },
        title: {
          type: 'string'
        },
        closed: {
          type: 'boolean'
        }
      },
      type: 'object'
    }
  },
  required: ['body'],
  type: 'object'
};
