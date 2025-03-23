import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  // private appLoad = new BehaviorSubject<boolean>(false);
  // appLoad$ = this.appLoad.asObservable();

  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  constructor() {}

  open() {
    console.log(`Loading .....`);
    this.loading.next(true);
  }

  close() {
    console.log(`Loading... DONE`);
    this.loading.next(false);
  }

  //   appOpen() {
  //     console.log(`App Loading .....`);
  //     this.appLoad.next(true);
  //   }

  //   appClose() {
  //     console.log(`App Load ... DONE`);
  //     this.appLoad.next(false);
  //   }
}
