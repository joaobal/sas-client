import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

import { LayoutService } from '../../services/layout.service';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [
        RouterLink, 
        RouterLinkActive, 
        NgOptimizedImage],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent {
    private layoutService = inject(LayoutService);

    // This method will be called when a link is clicked to ensure
    // the sidebar closes after navigation on mobile.
    onLinkClick(): void {
        this.layoutService.closeSidebar();
    }

    onLogout(): void {
        // In a real app, you would call an authentication service here.
        console.log('Logging out...');
        this.layoutService.closeSidebar();
        // this.authService.logout();
    }
}