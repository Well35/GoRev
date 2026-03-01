<script setup lang="ts">
import { ref, computed } from 'vue';
import TerminalPanel from '@/components/layout/TerminalPanel.vue';
import InputBar from '@/components/layout/InputBar.vue';
import ConnectOverlay from '@/components/ConnectOverlay.vue';
import { useWebSocket } from '@/composables/useWebSocket';

const metaMudName =
    document.querySelector<HTMLMetaElement>('meta[name="gomud-mudname"]')?.content ?? 'GoMud';

const terminalRef = ref<{ write: (d: string) => void; focus: () => void } | null>(null);
const hasConnected = ref(false);
const connecting = ref(false);

const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}//${location.host}/ws`;

const webSocket = useWebSocket(wsUrl, (data) => {
    terminalRef.value?.write(data);
});

const handleConnect = () => {
    connecting.value = true;
    webSocket.connect();
    const interval = setInterval(() => {
        if (webSocket.connected.value) {
            connecting.value = false;
            hasConnected.value = true;
            terminalRef.value?.focus();
            clearInterval(interval);
        }
    }, 100);
};

const handleSend = (cmd: string) => {
    webSocket.send(cmd + '\n');
};

const showOverlay = computed(() => !hasConnected.value || !webSocket.connected.value);
</script>

<template>
    <div class="h-full flex flex-col overflow-hidden relative">
        <TerminalPanel ref="terminalRef" />

        <InputBar :disabled="!webSocket.connected" @send="handleSend" />

        <ConnectOverlay
            v-if="showOverlay"
            :mud-name="metaMudName"
            :connecting="connecting"
            @connect="handleConnect"
        />
    </div>
</template>
