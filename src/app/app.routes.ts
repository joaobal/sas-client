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
        data: { title: 'Watch' },
        loadComponent: () =>
            import('./features/watch/watch.component').then(
                (c) => c.WatchComponent
            ),
    },
    {
        path: 'stream',
        data: { title: 'Stream' },
        loadComponent: () =>
            import('./features/stream/stream.component').then((c) => c.StreamComponent),
    },
    {
        path: 'settings',
        data: { title: 'Settings' },
        loadComponent: () =>
            import('./features/settings/settings.component').then((c) => c.SettingsComponent),
    },
    {
        // A simple wildcard redirect
        path: '**',
        redirectTo: 'watch',
    }
];