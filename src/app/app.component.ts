import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { NavBarComponent } from './core/components/nav-bar/nav-bar.component';
import { LayoutService } from './core/services/layout.service';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NgOptimizedImage, NavBarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
    layoutService = inject(LayoutService);
    isSidebarOpen = this.layoutService.isSidebarOpen;
    
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    
    currentPageTitle = signal<string>('');

    ngOnInit(): void {
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map(() => {
                let route = this.activatedRoute;
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route.snapshot.data['title'];
            })
        ).subscribe((title: string) => {
            if (title) {
                this.currentPageTitle.set(title);
            }
        });
    }
}