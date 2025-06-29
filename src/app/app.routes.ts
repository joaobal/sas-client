import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        // Redirect the root path to our watch component
        path: '',
        pathMatch: 'full',
        redirectTo: 'watch',
    },
    {
        // Lazily load the WatchComponent
        path: 'watch',
        loadComponent: () =>
            import('./features/watch/watch.component').then(
                (c) => c.WatchComponent
            ),
    },
    {
        // A simple wildcard redirect
        path: '**',
        redirectTo: 'watch',
    }
];