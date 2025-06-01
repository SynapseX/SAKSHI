import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { type FirebaseApp, initializeApp } from 'firebase/app';
import { type Analytics, getAnalytics } from 'firebase/analytics';
import { GoogleAuthProvider, getAuth, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { IUserOutput, User, UserOutput } from '../_models/User';
import { ConfigService } from './config.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpContext } from '@angular/common/http';
import { IGNORED_STATUSES } from '@/_interceptors/error.interceptor';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORE_USER_KEY = '__AUTH__';
  private readonly BASE_API_URL = this.cfgSrv.get('API_BASE_URL');

  private app!: FirebaseApp;
  private analytics!: Analytics;

  currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(
    private cfgSrv: ConfigService,
    private router: Router,
    private tstSrv: ToastrService,
    private http: HttpClient,
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
        }),
      ); // Base64 encode

      localStorage.setItem(this.STORE_USER_KEY, encodedUser);
    } else {
      this.clearUser();
    }
    this.currentUserSource.next(user);
  }

  getUser(): User | null {
    const encodedUser = localStorage.getItem(this.STORE_USER_KEY);
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
    localStorage.removeItem(this.STORE_USER_KEY);
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

          this.getDBUser(user.email || '').subscribe({
            next: (u: any) => {
              // TODO: Match the uid from GoogleAuth, with UID from DB
              console.log(u, user);

              if (u.user) this.setUser(user);
              else {
                console.log('Trying to add user');

                const new_user = new UserOutput({
                  _id: user.uid,
                  email: user.email!,
                  name: user.displayName!,
                });

                this.addDBUser(new_user).subscribe({
                  next: (res) => {
                    console.log({ res });

                    this.setUser(user);
                  },
                });
              }
            },
            error: (err) => {
              console.error('Could not sign in. Try Later', err);
            },
          });
        })
        .catch((error) => {
          this.tstSrv.error('Could not sign in. Try Later');
        });
    });
  }

  getDBUser(email: string) {
    const url = `${this.BASE_API_URL}/user?email=${email}`;
    return this.http.get(url, {
      context: new HttpContext().set(IGNORED_STATUSES, [404]),
    });
  }

  addDBUser(user: IUserOutput | null) {
    const url = `${this.BASE_API_URL}/user`;
    return this.http.post(url, user);
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
