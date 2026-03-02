<script setup lang="ts">
import Button from '@/components/ui/button.vue'

const Directions = {
    North: 'north',
    South: 'south',
    East:  'east',
    West:  'west',
    Up:    'up',
    Down:  'down',
} as const;

type Direction = typeof Directions[keyof typeof Directions];

const emit = defineEmits<{ move: [direction: Direction] }>();
const go = (direction: Direction) => emit('move', direction);
</script>

<template>
    <div class="border-b border-[var(--border-panel)]">
        <div class="bg-[var(--bg-panel-header)] border-b border-[var(--border-panel)] py-[5px] px-[10px] text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
            Movement
        </div>
        <div class="py-[10px] px-2 flex items-center justify-center gap-3">
            <div class="compass-grid">
                <span />
                <Button size="icon" @click="go(Directions.North)">↑</Button>
                <span />
                <Button size="icon" @click="go(Directions.West)">←</Button>
                <span />
                <Button size="icon" @click="go(Directions.East)">→</Button>
                <span />
                <Button size="icon" @click="go(Directions.South)">↓</Button>
                <span />
            </div>
            <div class="flex flex-col gap-1">
                <Button size="icon" class="text-[1.1rem] shrink-0" title="Up" @click="go(Directions.Up)">↥</Button>
                <Button size="icon" class="text-[1.1rem] shrink-0" title="Down" @click="go(Directions.Down)">↧</Button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.compass-grid {
    display: grid;
    grid-template-columns: repeat(3, 42px);
    grid-template-rows: repeat(3, 32px);
    gap: 3px;
}
</style>
