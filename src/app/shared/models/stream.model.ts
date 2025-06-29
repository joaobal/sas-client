export interface Stream {
    id: string;
    name: string;
    url: string;
}

export interface StreamAnalytics {
    resolution: string;
    framerate: number;
    latency: number; // in seconds
    bitrate: string; // in kbps
}