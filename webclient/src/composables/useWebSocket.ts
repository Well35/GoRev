import { ref } from 'vue';

const isProtocolMessage = (data: string): boolean =>
    data.startsWith('!!GMCP(') ||
    data.startsWith('!!MUSIC(') ||
    data.startsWith('!!SOUND(') ||
    data === 'TEXTMASK:true' ||
    data === 'TEXTMASK:false';

export const useWebSocket = (wsUrl: string, onData: (data: string) => void) => {
    const connected = ref(false);
    let ws: WebSocket | null = null;

    const connect = () => {
        if (ws) ws.close();
        ws = new WebSocket(wsUrl);

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
            if (!isProtocolMessage(event.data)) {
                onData(event.data);
            }
        };
    };

    const send = (data: string) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    };

    const disconnect = () => {
        ws?.close();
        ws = null;
    };

    return { connected, connect, send, disconnect };
};
