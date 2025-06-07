import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { AuthComponent } from './features/auth/auth.component';
import { MeetComponent } from './features/meet/meet.component';
import { SessionsComponent } from './features/sessions/sessions.component';
import { SessHomeComponent } from './features/sessions/sess-home/sess-home.component';
import { CreateComponent } from './features/sessions/create/create.component';

import { NotFoundComponent } from '@/errors/not-found/not-found.component';
import { ServerErrorComponent } from '@/errors/server-error/server-error.component';

import { authGuard } from '@/_guards/auth.guard';
import { optAuthGuard } from '@/_guards/opt_auth.guard';
import { ProfileComponent } from '@/features/profile/profile.component';
import { AboutComponent } from './features/about/about.component';
import { authResolver } from './_resolvers/auth.resolver';
import { MainWithNavComponent } from './layouts/main-with-nav/main-with-nav.component';
import { sessionResolver } from './_resolvers/session.resolver';
import { sessionTitleResolver } from './_resolvers/sessionTitle.resolver';

export const routes: Routes = [
  {
    path: '',
    component: MainWithNavComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [optAuthGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
        title: 'About Us',
      },
      {
        path: 'auth',
        component: AuthComponent,
        title: 'Signin to get a FREE Session on SAKSHI.AI',
        resolve: { to: authResolver },
      },
    ],
  },
  {
    path: '',
    component: MainWithNavComponent,
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Your Profile',
      },
      {
        path: 'sessions',
        component: SessionsComponent,
        children: [
          {
            path: '',
            component: SessHomeComponent,
            title: 'Sessions',
          },
          {
            path: 'create',
            component: CreateComponent,
            title: 'Create a Session',
          },
        ],
      },
    ],
  },
  {
    path: 'meet',
    redirectTo: 'sessions',
    pathMatch: 'full',
  },
  {
    path: 'meet/:sessionId',
    component: MeetComponent,
    resolve: { session: sessionResolver },
    canActivate: [authGuard],
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    title: 'Error 404',
  },
  {
    path: 'server-error',
    component: ServerErrorComponent,
    title: 'Internal Server Error',
  },
  {
    path: '**',
    component: NotFoundComponent,
    pathMatch: 'full',
    title: 'Error 404',
  },
];
