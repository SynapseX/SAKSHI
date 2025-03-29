import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { MeetComponent } from './meet/meet.component';
import { SessionsComponent } from './sessions/sessions.component';
import { ConversationComponent } from './conversation/conversation.component';
import { SessHomeComponent } from './sessions/sess-home/sess-home.component';
import { CreateComponent } from './sessions/create/create.component';

import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';

import { authGuard } from './_guards/auth.guard';
import { optAuthGuard } from './_guards/opt_auth.guard';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'SAKSHI.AI',
    canActivate: [optAuthGuard],
  },
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [optAuthGuard],
    title: 'Signin to get a FREE Session on SAKSHI.AI',
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
