import * as URI from 'urijs';

export type RequestBuilderParams = {
  baseURI?: uri.URI;
  accessToken?: string;
  isProxy?: boolean;
};

export abstract class RequestBuilder {
  protected readonly baseURI: uri.URI;
  /** accessToken */
  private readonly accessToken: string | null;
  /** proxy 여부 결정 */
  protected readonly isProxy: boolean;
  constructor({
    baseURI = URI(''),
    accessToken = '',
    isProxy = false
  }: RequestBuilderParams = {}) {
    this.baseURI = baseURI;
    this.accessToken = accessToken;
    this.isProxy = isProxy;
  }

  get AccessTokenObject() {
    return this.accessToken ? { 'access-token': this.accessToken } : {};
  }

  public abstract getAPIPath(path: string): uri.URI;
}
