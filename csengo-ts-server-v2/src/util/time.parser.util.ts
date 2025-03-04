export function parseDuration(durationString: string): { minutes: number; seconds: number } | null {
    const parts = durationString.split(':');
    const minutes = parseInt(parts[0]);
    const seconds = parseInt(parts[1]);

    if (isNaN(minutes) || isNaN(seconds)) {
        return null;
    }

    return { minutes, seconds };
}
