<script setup lang="ts">
const props = defineProps<{
    mudName: string;
    connecting: boolean;
}>();

const emit = defineEmits<{
    connect: [];
}>();
</script>

<template>
    <div
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
    >
        <div
            class="flex flex-col items-center gap-6 p-8 rounded-xl border border-border bg-card shadow-2xl max-w-sm w-full mx-4"
        >
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-2">
                    {{ mudName }}
                </h1>
                <p class="text-muted-foreground text-sm">Web Client</p>
            </div>

            <button
                :disabled="connecting"
                class="w-full py-2.5 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                @click="emit('connect')"
            >
                {{ connecting ? 'Connecting…' : 'Connect' }}
            </button>
        </div>
    </div>
</template>
