import { Injectable } from '@angular/core';
import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Analytics, getAnalytics } from 'firebase/analytics';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  onAuthStateChanged,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { User } from '../_models/User';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #app!: FirebaseApp;
  #analytics!: Analytics;

  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private cfgSrv: ConfigService) {
    const firebaseConfig = {
      apiKey: cfgSrv.get('API_KEY'),
      authDomain: cfgSrv.get('AUTH_DOMAIN'),
      projectId: cfgSrv.get('PROJECT_ID'),
      storageBucket: cfgSrv.get('STORAGE_BUCKET'),
      messagingSenderId: cfgSrv.get('MESSAGING_SENDER_ID'),
      appId: cfgSrv.get('APP_ID'),
      measurementId: cfgSrv.get('MEASUREMENT_ID'),
    };
    if (!this.#app) this.#app = initializeApp(firebaseConfig);
    if (!this.#analytics) this.#analytics = getAnalytics(this.#app);
  }

  checkUserLoggedIn() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((token) => {
          const userObj: User = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            uid: user.uid,
            accessToken: token,
          };
          this.currentUserSource.next(userObj);
        });
      } else {
        this.currentUserSource.next(null);
      }
    });
  }

  googleSignIn() {
    signInWithPopup(getAuth(this.#app), new GoogleAuthProvider())
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user: User = {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
          accessToken: token,
        };
        this.currentUserSource.next(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        // const credential = GoogleAuthProvider.credentialFromError(error);

        console.error({ errorCode, errorMessage, email });
      });
  }

  googleSignOut() {
    getAuth(this.#app)
      .signOut()
      .then(() => {
        this.currentUserSource.next(null);
      })
      .catch((error) => {
        console.log('Error in signout', error);
      });
  }
}
