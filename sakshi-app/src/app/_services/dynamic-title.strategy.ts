import { ISessionOutput } from '@/_models/Session';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class DynamicTitleStrategy extends TitleStrategy {
  constructor(private readonly titleService: Title) {
    // Renamed from 'title' to avoid conflict
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState); // Gets any static title defined in routes

    let currentRoute = routerState.root;
    let session: ISessionOutput | null = null;

    while (currentRoute) {
      if (currentRoute.data && currentRoute.data['session']) {
        session = currentRoute.data['session'] as ISessionOutput;
        break; // Found the session, no need to go deeper
      }
      currentRoute = currentRoute.firstChild!;
    }

    if (session && session.title) {
      this.titleService.setTitle(`Meeting [${session.title.session_title}] | SAKSHI.AI`);
    } else if (title !== undefined) this.titleService.setTitle(`${title} | SAKSHI.AI`);
    else this.titleService.setTitle('SAKSHI.AI');
  }

  // Helper to find the deepest activated route data if needed,
  // though for a single-level item resolver, the above loop is sufficient.
  // private getDeepestChildSnapshot(snapshot: RouterStateSnapshot): ActivatedRouteSnapshot {
  //   let deepestChild = snapshot.root;
  //   while (deepestChild.firstChild) {
  //     deepestChild = deepestChild.firstChild;
  //   }
  //   return deepestChild;
  // }
}
