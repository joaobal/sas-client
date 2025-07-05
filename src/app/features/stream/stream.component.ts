import {
    Component,
    ChangeDetectionStrategy,
    OnInit,
    OnDestroy,
    signal,
    viewChild,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// This declares the OvenPlayer global object provided by the script.
declare const OvenPlayer: any;

// --- Data Models ---
interface Analyzer {
    id: number;
    name: string;
}

interface AnalysisStatistics {
    framerate: number;
    latency: number;
    objectsDetected: number;
    alerts: number;
}

@Component({
    selector: 'app-stream',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './stream.component.html',
    styleUrl: './stream.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamComponent implements OnInit, AfterViewInit, OnDestroy {
    // --- Player Element References ---
    private rawPlayerContainer = viewChild.required<ElementRef<HTMLDivElement>>('rawPlayer');
    private analysisPlayerContainer = viewChild.required<ElementRef<HTMLDivElement>>('analysisPlayer');
    private rawPlayer: any;
    private analysisPlayer: any;

    // --- Component State Signals ---
    availableCameras = signal<MediaDeviceInfo[]>([]);
    selectedCameraId = signal<string>('');

    analyzers = signal<Analyzer[]>([
        { id: 1, name: 'Car Detector' },
        { id: 2, name: 'People Detector' },
        { id: 3, name: 'Movement Detector' },
        { id: 4, name: 'AI detector #1' },
    ]);
    selectedAnalyzerId = signal<number>(2); // Default to 'People Detector'

    // Placeholder for statistics
    statistics = signal<AnalysisStatistics>({
        framerate: 29.97,
        latency: 0.8,
        objectsDetected: 12,
        alerts: 2,
    });

    ngOnInit(): void {
        this.getAvailableCameras();
    }

    ngAfterViewInit(): void {
        this.initializePlayers();
    }

    ngOnDestroy(): void {
        // Clean up players to prevent memory leaks
        this.rawPlayer?.remove();
        this.analysisPlayer?.remove();
    }

    /**
     * Uses the browser's Media Devices API to get a list of available video cameras.
     */
    async getAvailableCameras(): Promise<void> {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                this.availableCameras.set(videoDevices);

                // If there are cameras, select the first one by default
                if (videoDevices.length > 0) {
                    this.selectedCameraId.set(videoDevices[0].deviceId);
                    // We would now initialize the raw stream with this device
                    this.startRawStream(videoDevices[0].deviceId);
                }
            } catch (error) {
                console.error('Error enumerating media devices.', error);
            }
        }
    }

    onCameraSelectionChange(event: Event): void {
        const selectElement = event.target as HTMLSelectElement;
        const deviceId = selectElement.value;
        this.selectedCameraId.set(deviceId);
        this.startRawStream(deviceId);
    }

    /**
     * Placeholder function to start the raw camera feed.
     * In a real app, this would get the media stream and pass it to OvenMediaEngine.
     */
    startRawStream(deviceId: string): void {
        console.log(`Starting stream for camera: ${deviceId}`);
        // Here you would use navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } } })
        // and then send this stream to your OvenMediaEngine server, which would give you
        // a WebRTC URL to play in the 'rawPlayer'.
        // For now, we'll just log it.
    }

    selectAnalyzer(analyzerId: number): void {
        this.selectedAnalyzerId.set(analyzerId);
        console.log(`Analyzer ${analyzerId} selected. Informing backend...`);
        // Here you would make an API call to the backend to switch the analysis model.
    }

    addAnalyzer(): void {
        const newId = Math.max(...this.analyzers().map(a => a.id), 0) + 1;
        const newAnalyzer: Analyzer = {
            id: newId,
            name: `New Analyzer #${newId}`
        };
        this.analyzers.update(currentAnalyzers => [...currentAnalyzers, newAnalyzer]);
    }

    /**
     * Initializes both OvenMedia players.
     * We use a helper to wait for the OvenPlayer script to be ready.
     */
    private initializePlayers(): void {
        this.waitForOvenPlayer().then(() => {
            // --- Raw Player (Left) ---
            // In a real scenario, the source URL would come from your OvenMediaEngine
            // after you send it the raw camera feed.
            this.rawPlayer = OvenPlayer.create(this.rawPlayerContainer().nativeElement, {
                autoStart: true,
                mute: true,
                sources: [{
                    type: 'webrtc',
                    file: 'ws://localhost:3333/app/stream_raw_placeholder' // Placeholder URL
                }]
            });

            // --- Analysis Player (Right) ---
            this.analysisPlayer = OvenPlayer.create(this.analysisPlayerContainer().nativeElement, {
                autoStart: true,
                mute: true,
                sources: [{
                    type: 'webrtc',
                    file: 'ws://localhost:3333/app/stream' // Main analysis stream
                }]
            });
        }).catch(err => console.error(err));
    }

    private waitForOvenPlayer(maxRetries = 40): Promise<void> {
        return new Promise((resolve, reject) => {
            const check = (retries: number) => {
                if (typeof OvenPlayer !== 'undefined') {
                    resolve();
                } else if (retries > 0) {
                    setTimeout(() => check(retries - 1), 50);
                } else {
                    reject('OvenPlayer script did not load in time.');
                }
            };
            check(maxRetries);
        });
    }
}