import * as firebase from 'firebase';

import { apiKey, appTokenKey, authDomain, loginUserKey } from '../constants/constants';

class AuthType {
  private fb;
  private gAuthProvider: firebase.auth.GoogleAuthProvider;

  constructor() {
    this.fb = firebase;
    this.fb.initializeApp({
      authDomain,
      apiKey,
    });
    this.gAuthProvider = new firebase.auth.GoogleAuthProvider();
  }

  get googleProvider() {
    return this.gAuthProvider;
  }

  get firebaseAuth() {
    return this.fb.auth;
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

  public logout() {
    return this.fb.auth().signOut().then((_) => {
      if (!!window && !!localStorage) {
        localStorage.removeItem(appTokenKey);
        localStorage.removeItem(loginUserKey);
      }
    });
  }
}

export const Auth = new AuthType();