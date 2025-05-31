import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config = (window as any).b5984ae6676c_public || {};

  getAll() {
    return this.config;
  }

  get(key: string): any {
    return this.config[key];
  }
}
