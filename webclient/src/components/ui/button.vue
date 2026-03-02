<script setup lang="ts">
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center font-mono transition-colors disabled:pointer-events-none disabled:opacity-40',
    {
        variants: {
            variant: {
                // Dark fill + border — movement, win-btns, etc.
                default: [
                    'bg-[#061414] border border-[var(--border-panel)]',
                    'text-[var(--text-secondary)]',
                    'hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] hover:bg-[rgba(0,192,176,0.07)]',
                ],
                // Teal fill — send, connect
                primary: [
                    'bg-[var(--accent-blue)] border-none text-white',
                    'transition-opacity hover:opacity-85',
                ],
                // No background — icon buttons, tab-adjacent buttons
                ghost: [
                    'bg-transparent border-none',
                    'text-[var(--text-secondary)] hover:text-[var(--accent-blue)]',
                ],
                // Channel selector pills — inactive/active toggled via class override
                pill: [
                    'bg-[#061414] border border-[var(--border-panel)]',
                    'text-[var(--text-muted)]',
                    'hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]',
                ],
            },
            size: {
                default: 'px-[14px] py-[4px] text-[0.75rem]',
                sm: 'px-1 py-[5px] text-[0.68rem]',
                icon: 'w-[32px] h-[32px] p-0 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

interface Props {
    variant?: ButtonVariants['variant'];
    size?: ButtonVariants['size'];
    class?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <button
        :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
        v-bind="$attrs"
    >
        <slot />
    </button>
</template>
