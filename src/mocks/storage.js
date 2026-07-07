const PREFIX = "cliniq_mock_";

export function loadState(key, fallback) {
    try {
        const raw = sessionStorage.getItem(PREFIX + key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function saveState(key, value) {
    try {
        sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
        // ignore
    }
}
