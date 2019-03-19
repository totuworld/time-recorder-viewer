import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const JSCFindAllBeverage: IJSONSchemaType = {
  properties: {
    query: {
      properties: {
        page: {
          type: 'number',
          default: 1,
          minimum: 1
        },
        limit: {
          type: 'number',
          default: 20,
          maximum: 90
        }
      }
    }
  }
};
