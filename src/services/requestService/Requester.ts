import * as Ajv from 'ajv';
import debug from 'debug';

const log = debug('trv:Requester');

export class Requester {
  public url: string;
  public start: Date | null = null;
  public end: Date | null = null;
  public duration: number | null = null;

  public static validateParam(param: object, schema: object): boolean {
    try {
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const valid = validate(param);
      if (valid === false) {
        log(validate.errors);
      }
      return !!valid && typeof valid === 'boolean' ? valid : false;
    } catch (err) {
      log(err);
      return false;
    }
  }

  constructor(url: string) {
    this.url = url;
  }

  public onStart() {
    log('onStart', this.url);
    this.start = new Date();
  }

  public onEnd() {
    this.end = new Date();
    if (!!this.start) {
      this.duration = this.end.getTime() - this.start.getTime();
    }
    log('onEnd', this.url, this.duration + 'ms');
  }
}
