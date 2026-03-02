<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const containerRef = ref<HTMLDivElement | null>(null);
let terminal: Terminal | null = null;
let fitAddon: FitAddon | null = null;
let resizeObserver: ResizeObserver | null = null;

const exposed = {
    write(data: string) {
        terminal?.write(data);
    },
    focus() {
        terminal?.focus();
    },
};

defineExpose(exposed);

onMounted(() => {
    if (!containerRef.value) return;

    terminal = new Terminal({
        theme: {
            background: '#020a0a',
            foreground: '#d0e4e0',
            cursor: '#00c0b0',
            black: '#020a0a',
            brightBlack: '#0d2a2a',
            white: '#d0e4e0',
            brightWhite: '#eef8f6',
        },
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
        scrollback: 5000,
        allowProposedApi: true,
    });

    fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.value);
    fitAddon.fit();

    resizeObserver = new ResizeObserver(() => {
        fitAddon?.fit();
    });
    resizeObserver.observe(containerRef.value);
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    terminal?.dispose();
});
</script>

<template>
    <div class="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#020a0a]">
        <div ref="containerRef" class="flex-1 min-h-0 p-1" />
    </div>
</template>
