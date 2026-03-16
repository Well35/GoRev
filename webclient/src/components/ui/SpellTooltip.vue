<script setup lang="ts">
import { computed } from 'vue';
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from 'radix-vue';
import type { CharSpell } from '@/stores/char';

const props = defineProps<{ spell: CharSpell }>();

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Replaces all dice notation tokens in a string with min-max ranges.
// e.g. "Hurts for 1d3+1" → "Hurts for 2-4"
function formatDescription(text: string): string {
    return text.replace(/(\d+@)?(\d+)d(\d+)([+-]\d+)?(#[\d,]+)?/gi, (_, atk, count, sides, bonus) => {
        const c = parseInt(count);
        const s = parseInt(sides);
        const b = bonus ? parseInt(bonus) : 0;
        return `${c + b}-${c * s + b}`;
    });
}

const schoolColor = computed(() => {
    switch (props.spell.school.toLowerCase()) {
        case 'fire':        return 'text-[#ff6633]';
        case 'ice':
        case 'frost':       return 'text-[#88ddff]';
        case 'electricity': return 'text-[#ffee44]';
        case 'restoration': return 'text-[#44ff88]';
        case 'conjuration': return 'text-[#bb88ff]';
        case 'death':       return 'text-[#cc4444]';
        default:            return 'text-[#a0a8b8]';
    }
});
</script>

<template>
    <TooltipProvider :delay-duration="300">
        <TooltipRoot>
            <TooltipTrigger as-child><slot /></TooltipTrigger>
            <TooltipContent
                side="left"
                :avoid-collisions="true"
                class="z-[60] w-[280px] p-0 border-2 border-[#1a3a6a] bg-[#0d1220] shadow-xl rounded-sm"
            >
                <!-- Name + school row -->
                <div class="px-3 pt-2 pb-1 flex items-baseline justify-between gap-2">
                    <span class="text-[0.88rem] font-bold text-[var(--text-primary)]">{{ spell.name }}</span>
                    <span class="text-[0.68rem] shrink-0" :class="schoolColor">{{ capitalize(spell.school) }}</span>
                </div>

                <!-- Cost row -->
                <div class="px-3 pb-1 flex items-center justify-between text-[0.72rem] text-[#a0a8b8]">
                    <span>{{ spell.cost }} Mana</span>
                    <span v-if="spell.wait">{{ spell.wait }} round cast</span>
                </div>

                <!-- Description -->
                <div v-if="spell.description" class="mx-3 mt-1 mb-2 border-t border-[#1a3a6a]/60 pt-1 text-[0.72rem] text-[#f0c040]">
                    {{ formatDescription(spell.description) }}
                </div>
            </TooltipContent>
        </TooltipRoot>
    </TooltipProvider>
</template>
