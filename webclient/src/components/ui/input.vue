<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
    class?: string;
    modelValue?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
    <input
        :class="
            cn(
                'flex-1 min-w-0 px-[10px] py-[4px]',
                'bg-[#061414] border border-[var(--border-panel)]',
                'text-[var(--text-primary)] font-mono text-[0.8rem]',
                'outline-none transition-colors',
                'focus:border-[var(--accent-blue)]',
                'disabled:opacity-40',
                props.class
            )
        "
        :value="props.modelValue"
        v-bind="$attrs"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
</template>
