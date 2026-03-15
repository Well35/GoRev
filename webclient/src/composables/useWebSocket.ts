import { ref } from 'vue';
import type { GMCPModule } from '@/lib/gmcp';

const parseGMCP = (msg: string): { module: string; payload: unknown } | null => {
    // Format: !!GMCP(Module.Name {...json...})
    const inner = msg.slice(7, -1); // strip leading !!GMCP( and trailing )
    const spaceIdx = inner.indexOf(' ');
    if (spaceIdx === -1) return null;
    try {
        return { module: inner.slice(0, spaceIdx), payload: JSON.parse(inner.slice(spaceIdx + 1)) };
    } catch {
        return null;
    }
};

export const useWebSocket = (
    wsUrl: string,
    onData: (data: string) => void,
    onGMCP?: (module: GMCPModule, payload: unknown) => void
) => {
    const connected = ref(false);
    let ws: WebSocket | null = null;

    const connect = (params?: Record<string, string>) => {
        if (ws) ws.close();
        const url = params ? wsUrl + '?' + new URLSearchParams(params).toString() : wsUrl;
        ws = new WebSocket(url);

        ws.onopen = () => {
            connected.value = true;
        };

        ws.onclose = () => {
            connected.value = false;
            ws = null;
        };

        ws.onerror = () => {
            connected.value = false;
        };

        ws.onmessage = (event: MessageEvent) => {
            const data: string = event.data;
            const trimmed = data.trim();
            if (pendingSilent.has(trimmed)) {
                pendingSilent.delete(trimmed);
                return;
            }
            if (data.startsWith('!!GMCP(')) {
                if (onGMCP) {
                    const parsed = parseGMCP(data);
                    if (parsed) onGMCP(parsed.module as GMCPModule, parsed.payload);
                }
            } else if (
                !data.startsWith('!!MUSIC(') &&
                !data.startsWith('!!SOUND(') &&
                data !== 'TEXTMASK:true' &&
                data !== 'TEXTMASK:false'
            ) {
                onData(data);
            }
        };
    };

    const pendingSilent = new Set<string>();

    const send = (data: string) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    };

    const sendSilent = (data: string) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            pendingSilent.add(data.trim());
            ws.send(data);
        }
    };

    const disconnect = () => {
        ws?.close();
        ws = null;
    };

    return { connected, connect, send, sendSilent, disconnect };
};
