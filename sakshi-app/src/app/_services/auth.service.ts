import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Analytics, getAnalytics } from 'firebase/analytics';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { User } from '../_models/User';
import { ConfigService } from './config.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_KEY = '__AUTH__';

  private app!: FirebaseApp;
  private analytics!: Analytics;

  currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(
    private cfgSrv: ConfigService,
    private router: Router,
    private tstSrv: ToastrService
  ) {
    const firebaseConfig = {
      apiKey: cfgSrv.get('API_KEY'),
      authDomain: cfgSrv.get('AUTH_DOMAIN'),
      projectId: cfgSrv.get('PROJECT_ID'),
      storageBucket: cfgSrv.get('STORAGE_BUCKET'),
      messagingSenderId: cfgSrv.get('MESSAGING_SENDER_ID'),
      appId: cfgSrv.get('APP_ID'),
      measurementId: cfgSrv.get('MEASUREMENT_ID'),
    };
    if (!this.app) this.app = initializeApp(firebaseConfig);
    if (!this.analytics) this.analytics = getAnalytics(this.app);
  }

  setUser(user: User | null) {
    if (user) {
      const encodedUser = btoa(
        JSON.stringify({
          displayName: user.displayName,
          email: user.email,
          uid: user.uid,
        })
      ); // Base64 encode

      localStorage.setItem(this.USER_KEY, encodedUser);
    } else {
      this.clearUser();
    }
    this.currentUserSource.next(user);
  }

  getUser(): User | null {
    const encodedUser = localStorage.getItem(this.USER_KEY);
    if (encodedUser) {
      try {
        return JSON.parse(atob(encodedUser));
      } catch (error) {
        console.error('Error decoding or parsing user:', error);
        this.clearUser(); // Clear invalid data
        return null;
      }
    }
    return null;
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  googleSignIn() {
    const auth = getAuth(this.app);
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithPopup(auth, new GoogleAuthProvider())
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
          this.setUser(user);
        })
        .catch((error) => {
          // const errorCode = error.code;
          // const errorMessage = error.message;
          // const email = error.customData.email;
          // const credential = GoogleAuthProvider.credentialFromError(error);
          this.tstSrv.error('Could not sign in. Try Later');
        });
    });
  }

  googleSignOut() {
    getAuth(this.app)
      .signOut()
      .then(() => {
        this.setUser(null);
        this.router.navigate(['/auth']);
      })
      .catch((error) => {
        console.log('Error in signout', error);
        this.tstSrv.error('Error in signout. Try Later');
      });
  }
}
