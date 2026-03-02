<script setup lang="ts">
const props = defineProps<{ value: string; modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
    <button
        class="flex-1 py-[7px] text-[0.78rem] uppercase tracking-[0.05em] bg-transparent border-0 border-b-2 cursor-pointer font-mono transition-[color,border-color] duration-[120ms] -mb-px hover:text-[var(--text-primary)]"
        :class="modelValue === value ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'"
        :style="{ borderBottomColor: modelValue === value ? 'var(--accent-blue)' : 'transparent' }"
        @click="emit('update:modelValue', value)"
    >
        <slot />
    </button>
</template>
