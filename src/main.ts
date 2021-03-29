import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

/**
 * Dont use @app/app.module because ng cli tools will fail on them
 */
import { AppModule } from './app/app.module';
import { environment } from '@environments/environment';



if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));