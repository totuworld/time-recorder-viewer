import { IJSONSchemaType } from '../../common/IJSONSchemaType';

export const PostAddOverloadJSONSchema: IJSONSchemaType = {
  description: '초과 근무를 사용한다.',
  properties: {
    body: {
      properties: {
        user_id: {
          type: 'string',
        },
        auth_user_id: {
          type: 'string',
        },
        target_date: {
          type: 'string',
          pattern: '^[0-9]{4}(0|1)[0-9](0|1|2|3)[0-9]'
        },
        duration: {
          type: 'string',
          pattern: '^(-?)P(?=\\d|T\\d)(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)([DW]))?(?:T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$' // tslint:disable-line
        }
      },
      required: ['user_id', 'auth_user_id', 'target_date', 'duration'],
    }
  },
  required: ['body'],
};
