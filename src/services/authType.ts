import * as firebase from 'firebase';

import { apiKey, appTokenKey, authDomain, loginUserKey } from '../constants/constants';
import { Auth } from './auth';

export class AuthType {
  private static instance: AuthType;

  private fb;
  private app: firebase.app.App;
  private gAuthProvider: firebase.auth.GoogleAuthProvider;
  private initDone: boolean = false;

  public static getInstance() {
    if (!AuthType.instance) {
      AuthType.instance = new AuthType();
    }
    return AuthType.instance;
  }

  constructor() {
    this.fb = firebase;
    this.app = this.fb.initializeApp({
      authDomain,
      apiKey,
    });
    this.initDone = true;
    this.gAuthProvider = new firebase.auth.GoogleAuthProvider();
  }

  get googleProvider() {
    return Auth.gAuthProvider;
  }

  get firebaseAuth() {
    return Auth.fb.auth;
  }

  get isLogined() {
    if (!!window && !!localStorage) {
      return !!localStorage.getItem(appTokenKey);
    }
    return false;
  }

  get loginUserKey() {
    if (!!window && !!localStorage) {
      return localStorage.getItem(loginUserKey);
    }
    return null;
  }

  get loginUserTokenKey() {
    if (!!window && !!localStorage) {
      return localStorage.getItem(appTokenKey);
    }
    return null;
  }

  public logout() {
    if (Auth.initDone === true) {
      Auth.app.auth().signOut().then((_) => {
        if (!!window && !!localStorage) {
          localStorage.removeItem(appTokenKey);
          localStorage.removeItem(loginUserKey);
        }
      });
    }
  }
}