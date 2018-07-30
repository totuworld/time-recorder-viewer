import { AxiosRequester } from './requesters/AxiosRequester';

export default class RequestService {
  public static create(url: string) {
    return new AxiosRequester(url);
  }
}
