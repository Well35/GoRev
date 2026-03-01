<script setup lang="ts">
import { ref } from 'vue';
import { useCommandHistory } from '@/composables/useCommandHistory';

const props = defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ send: [command: string] }>();

const inputValue = ref('');
const commandHistory = useCommandHistory();

const onSubmit = () => {
    const cmd = inputValue.value.trim();
    if (!cmd) return;
    commandHistory.push(cmd);
    emit('send', cmd);
    inputValue.value = '';
};

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const val = commandHistory.prev();
        if (val !== null) inputValue.value = val;
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        inputValue.value = commandHistory.next() ?? '';
    }
};
</script>

<template>
    <div class="flex gap-2 px-3 py-2 border-t border-border bg-card shrink-0">
        <input
            v-model="inputValue"
            :disabled="disabled"
            class="flex-1 px-3 py-1.5 rounded bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
            placeholder="Enter command..."
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            @keydown="onKeydown"
        />
        <button
            :disabled="disabled"
            class="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            @click="onSubmit"
        >
            Send
        </button>
    </div>
</template>
