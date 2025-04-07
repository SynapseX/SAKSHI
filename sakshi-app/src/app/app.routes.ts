import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { AuthComponent } from './features/auth/auth.component';
import { MeetComponent } from './features/meet/meet.component';
import { SessionsComponent } from './features/sessions/sessions.component';
import { ConversationComponent } from './features/conversation/conversation.component';
import { SessHomeComponent } from './features/sessions/sess-home/sess-home.component';
import { CreateComponent } from './features/sessions/create/create.component';

import { NotFoundComponent } from '@/errors/not-found/not-found.component';
import { ServerErrorComponent } from '@/errors/server-error/server-error.component';

import { authGuard } from '@/_guards/auth.guard';
import { optAuthGuard } from '@/_guards/opt_auth.guard';
import { ProfileComponent } from '@/features/profile/profile.component';
import { AboutComponent } from './features/about/about.component';
import { authResolver } from './_resolvers/auth.resolver';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'SAKSHI.AI',
    canActivate: [optAuthGuard],
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'About Us | SAKSHI.AI',
    canActivate: [optAuthGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [optAuthGuard],
    title: 'Signin to get a FREE Session on SAKSHI.AI',
    resolve: { to: authResolver },
  },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Your Profile | SAKSHI.AI',
      },
      { path: 'chat', component: ConversationComponent },
      {
        path: 'sessions',
        component: SessionsComponent,
        children: [
          {
            path: '',
            component: SessHomeComponent,
            title: 'Sessions | SAKSHI.AI',
          },
          {
            path: 'create',
            component: CreateComponent,
            title: 'Create a Session | SAKSHI.AI',
          },
        ],
      },
      {
        path: 'meet',
        component: MeetComponent,
        title: 'Session | SAKSHI.AI',
      },
    ],
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    title: 'Error 404 | SAKSHI.AI',
  },
  {
    path: 'server-error',
    component: ServerErrorComponent,
    title: 'Internal Server Error | SAKSHI.AI',
  },
  {
    path: '**',
    component: NotFoundComponent,
    pathMatch: 'full',
    title: 'Error 404 | SAKSHI.AI',
  },
];
