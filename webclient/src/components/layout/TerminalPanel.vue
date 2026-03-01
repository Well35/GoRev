<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

const containerRef = ref<HTMLDivElement | null>(null)
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
let resizeObserver: ResizeObserver | null = null

const exposed = {
  write(data: string) {
    terminal?.write(data)
  },
  focus() {
    terminal?.focus()
  },
}

defineExpose(exposed)

onMounted(() => {
  if (!containerRef.value) return

  terminal = new Terminal({
    theme: {
      background: '#0a0f1a',
      foreground: '#e2e8f0',
      cursor: '#e2e8f0',
      black: '#0a0f1a',
      brightBlack: '#1e293b',
      white: '#e2e8f0',
      brightWhite: '#f8fafc',
    },
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 14,
    lineHeight: 1.2,
    cursorBlink: true,
    scrollback: 5000,
    allowProposedApi: true,
  })

  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.open(containerRef.value)
  fitAddon.fit()

  resizeObserver = new ResizeObserver(() => {
    fitAddon?.fit()
  })
  resizeObserver.observe(containerRef.value)

  terminal.focus()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  terminal?.dispose()
})
</script>

<template>
  <div class="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#0a0f1a]">
    <div ref="containerRef" class="flex-1 min-h-0 p-1" />
  </div>
</template>
