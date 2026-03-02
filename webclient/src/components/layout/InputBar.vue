<script setup lang="ts">
import { ref } from 'vue';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import { useCommandHistory } from '@/composables/useCommandHistory';

defineProps<{ disabled: boolean }>();
const emit = defineEmits<{ send: [command: string] }>();

const inputValue = ref('');
const commandHistory = useCommandHistory();

const channels = ['Say', 'BCast', 'Group', 'Guild'] as const;
type Channel = (typeof channels)[number];
const activeChannel = ref<Channel>('Say');

const onSubmit = () => {
    const cmd = inputValue.value.trim();
    if (!cmd) return;
    commandHistory.push(cmd);
    emit('send', cmd);
    inputValue.value = '';
};

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Enter') {
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
    <div
        class="flex items-center gap-[5px] py-[6px] px-2 border-t border-[var(--border-panel)] bg-[var(--bg-panel-header)] shrink-0"
    >
        <div class="flex gap-[3px] shrink-0">
            <Button
                v-for="ch in channels"
                :key="ch"
                variant="pill"
                class="px-2 py-[2px] text-[0.6rem] whitespace-nowrap"
                :class="
                    activeChannel === ch
                        ? 'text-[var(--accent-blue)] border-[var(--accent-blue)] bg-[rgba(0,192,176,0.15)]'
                        : ''
                "
                @click="activeChannel = ch"
                >{{ ch }}</Button
            >
        </div>
        <Input
            v-model="inputValue"
            :disabled="disabled"
            placeholder="Enter command..."
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            @keydown="onKeydown"
        />
        <Button variant="primary" :disabled="disabled" class="shrink-0" @click="onSubmit"
            >Send</Button
        >
    </div>
</template>
