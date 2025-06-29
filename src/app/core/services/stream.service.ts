import { Injectable, signal } from '@angular/core';
import { Stream } from '../../shared/models/stream.model';

@Injectable({
    providedIn: 'root',
})
export class StreamService {
    // This is the placeholder for backend data.
    // In the future, you would fetch this data via an HTTP call
    // and update the signal accordingly.
    private readonly mockStreams: Stream[] = [
        {
            id: 'stream1',
            name: 'Main Camera',
            url: 'ws://localhost:3333/app/stream',
        },
        {
            id: 'stream2',
            name: 'Secondary Camera',
            url: 'ws://localhost:3333/app/stream2',
        },
    ];

    // Use a signal to hold the available streams.
    availableStreams = signal<Stream[]>(this.mockStreams);

    constructor() {
        // Here you would typically have a method like this.fetchStreamsFromBackend()
        //this.fetchStreamsFromBackend()
    }
}