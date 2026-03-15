<script setup lang="ts">
import { ref } from 'vue';
import { useDraggable } from '@vueuse/core';

defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();

const dialogEl = ref<HTMLElement | null>(null);
const headerEl = ref<HTMLElement | null>(null);

const initialX = typeof window !== 'undefined' ? Math.max(0, window.innerWidth / 2 - 400) : 100;
const initialY = typeof window !== 'undefined' ? Math.max(0, window.innerHeight / 2 - 250) : 80;

const { x, y } = useDraggable(dialogEl, {
    handle: headerEl,
    initialValue: { x: initialX, y: initialY },
});
</script>

<template>
    <div
        ref="dialogEl"
        class="fixed z-50 flex flex-col w-[800px] max-w-[96vw] max-h-[85vh] overflow-hidden border border-[var(--border-panel)] bg-[var(--bg-panel)] shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
        :style="{ left: x + 'px', top: y + 'px' }"
    >
        <!-- Header / drag handle -->
        <div
            ref="headerEl"
            class="flex items-center justify-between px-4 py-2 shrink-0 bg-[var(--bg-panel-header)] border-b border-[var(--border-panel)] cursor-grab active:cursor-grabbing select-none"
        >
            <span class="text-[0.7rem] font-bold tracking-[0.15em] uppercase text-[var(--text-muted)]">
                {{ title }}
            </span>
            <button
                class="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-lg leading-none px-1 cursor-pointer"
                @click="emit('close')"
            >
                ×
            </button>
        </div>
        <!-- Content -->
        <div class="flex-1 overflow-hidden flex flex-col min-h-0">
            <slot />
        </div>
    </div>
</template>
