import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // A signal to hold the open/closed state of the sidebar.
  // Private `writable` signal, public `readonly` signal.
  #isSidebarOpen = signal<boolean>(false);
  isSidebarOpen = this.#isSidebarOpen.asReadonly();

  toggleSidebar(): void {
    this.#isSidebarOpen.update(isOpen => !isOpen);
  }

  closeSidebar(): void {
    this.#isSidebarOpen.set(false);
  }
}