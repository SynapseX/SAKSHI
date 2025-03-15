import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private config = (window as any).__env || {};

    getAll() {
        return this.config;
    }

    get(key: string): any {
        return this.config[key];
    }
}
