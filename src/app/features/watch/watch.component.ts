import {
    Component,
    ChangeDetectionStrategy,
    inject,
    signal,
    viewChild,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    computed,
} from '@angular/core';
import { StreamService } from '../../core/services/stream.service';
import { Stream, StreamAnalytics } from '../../shared/models/stream.model';

// This declares the OvenPlayer global object provided by the script.
// We use 'any' here as there is no official @types/ovenplayer package.
declare const OvenPlayer: any;

@Component({
    selector: 'app-watch',
    standalone: true,
    templateUrl: './watch.component.html',
    styleUrl: './watch.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchComponent implements AfterViewInit, OnDestroy {
    // Dependencies
    private streamService = inject(StreamService);
    private playerContainer = viewChild.required<ElementRef<HTMLDivElement>>('playerContainer');

    // State Signals
    availableStreams = this.streamService.availableStreams;
    selectedStream = signal<Stream>(this.availableStreams()[0]);
    analytics = signal<StreamAnalytics | null>(null);

    // Private state for the player instance
    private player: any;

    ngAfterViewInit(): void {
        // Instead of calling initializePlayer directly, we call our new waiting function.
        this.waitForOvenPlayer();
    }

    private waitForOvenPlayer(maxRetries = 40): void {
        // Check if the global OvenPlayer object is now defined
        if (typeof OvenPlayer !== 'undefined') {
            // If it exists, it's safe to initialize the player.
            this.initializePlayer();
        } else if (maxRetries > 0) {
            // If not, wait 50 milliseconds and try again.
            // We use a retry counter to prevent an infinite loop if the script fails to load.
            setTimeout(() => this.waitForOvenPlayer(maxRetries - 1), 50);
        } else {
            // If the script hasn't loaded after 2 seconds (40 * 50ms), log an error.
            console.error('OvenPlayer script did not load in time. Please check angular.json and network connectivity.');
        }
    }

    ngOnDestroy(): void {
        // Crucial for preventing memory leaks
        this.player?.remove();
    }

    onStreamSelect(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const newUrl = selectElement.value;
        const newStream = this.availableStreams().find(s => s.url === newUrl);
        
        if (newStream) {
            this.selectedStream.set(newStream);
            this.player.load({
                sources: [
                    {
                        label: newStream.name,
                        type: 'webrtc',
                        file: newStream.url,
                    },
                ],
            });
        }
    }

    private initializePlayer(): void {
        this.player = OvenPlayer.create(this.playerContainer().nativeElement, {
            autoStart: true,
            mute: true, // Recommended for autoplay policies
            sources: [
                {
                    label: this.selectedStream().name,
                    type: 'webrtc',
                    file: this.selectedStream().url,
                },
            ],
        });

        // Run event handling after 1 second
        setTimeout(() => {
            this.listenForPlayerEvents();
        }, 3000);
    }

    private listenForPlayerEvents(): void {
        // --- Placeholder for Backend Events ---
        // In the future, you might use a WebSocket connection here to send
        // analytics back to your server or receive commands.
        // e.g., this.backendSocket.send('playerInitialized');
        
        this.player.on('framerate', (framerate: number) => {
            this.analytics.update(current => ({
                ...(current ?? this.getInitialAnalytics()),
                framerate,
            }));
        });

        this.player.on('videoBitrate', (bitrate: number) => {
            this.analytics.update(current => ({
                ...(current ?? this.getInitialAnalytics()),
                bitrate: `${(bitrate / 1000).toFixed(0)} kbps`,
            }));
        });
        
        this.player.on('latency', (latency: number) => {
            this.analytics.update(current => ({
                ...(current ?? this.getInitialAnalytics()),
                latency, // OvenPlayer reports latency in seconds
            }));
        });

        this.player.on('videoResolution', (res: { width: number, height: number}) => {
             this.analytics.update(current => ({
                ...(current ?? this.getInitialAnalytics()),
                resolution: `${res.width}x${res.height}`,
            }));
        });

        this.player.on('config', (res: { width: number, height: number}) => {
             this.analytics.update(current => ({
                ...(current ?? this.getInitialAnalytics()),
                resolution: `${res.width}x${res.height}`,
            }));
        });
    }

    private getInitialAnalytics(): StreamAnalytics {
        return {
            resolution: 'N/A',
            framerate: 0,
            latency: 0,
            bitrate: '0 kbps',
        };
    }
}