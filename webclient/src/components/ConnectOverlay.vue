<script setup lang="ts">
import Button from '@/components/ui/button.vue';

defineProps<{
    mudName: string;
    connecting: boolean;
}>();

const emit = defineEmits<{
    connect: [];
}>();
</script>

<template>
    <div class="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(2,8,16,0.92)]">
        <div
            class="flex flex-col items-center gap-4 py-9 px-12 bg-[var(--bg-panel)] border border-[var(--border-panel)] min-w-[280px]"
        >
            <div class="text-2xl font-bold text-[var(--accent-blue)] tracking-[0.1em] uppercase">
                {{ mudName }}
            </div>
            <div class="text-[0.85rem] text-[var(--text-muted)] tracking-[0.06em] uppercase -mt-2">
                Web Client
            </div>
            <Button
                variant="primary"
                :disabled="connecting"
                class="mt-2 w-full py-[10px] px-6 text-[0.9rem] font-bold tracking-[0.08em] uppercase"
                @click="emit('connect')"
            >
                {{ connecting ? 'Connecting…' : 'Connect' }}
            </Button>
        </div>
    </div>
</template>
