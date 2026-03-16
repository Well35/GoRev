<script setup lang="ts">
import { computed } from 'vue';
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from 'radix-vue';
import type { InventoryItem } from '@/stores/char';

const props = defineProps<{
    item: InventoryItem;
    equipped?: boolean;
}>();

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Converts dice notation (e.g. "2@1d6+1#3") to a readable range like "2-7 ×2"
function diceToRange(roll: string): string {
    // Strip crit buff ids after #
    const stripped = roll.split('#')[0].trim();

    // Parse optional attacks prefix: "2@..."
    let attacks = 1;
    let rest = stripped;
    if (stripped.includes('@')) {
        const [atk, remainder] = stripped.split('@');
        attacks = parseInt(atk) || 1;
        rest = remainder;
    }

    // Parse optional bonus/penalty suffix: "+2" or "-1"
    let bonus = 0;
    const bonusMatch = rest.match(/([+-]\d+)$/);
    if (bonusMatch) {
        bonus = parseInt(bonusMatch[1]);
        rest = rest.slice(0, rest.length - bonusMatch[1].length);
    }

    // Parse "NdN"
    const diceMatch = rest.match(/^(\d+)d(\d+)$/i);
    if (!diceMatch) return roll; // fallback to raw string

    const count = parseInt(diceMatch[1]);
    const sides = parseInt(diceMatch[2]);
    const min = count + bonus;
    const max = count * sides + bonus;

    return attacks > 1 ? `${min}-${max} ×${attacks}` : `${min}-${max}`;
}

const nameColor = computed(() => {
    const t = props.item.type.toLowerCase();
    if (t === 'weapon') return 'text-[#ffaa44]';
    if (['head', 'neck', 'body', 'belt', 'gloves', 'ring', 'legs', 'feet', 'offhand'].includes(t)) return 'text-[#88ccff]';
    return 'text-[var(--text-primary)]';
});
</script>

<template>
    <TooltipProvider :delay-duration="300">
        <TooltipRoot>
            <TooltipTrigger as-child><slot /></TooltipTrigger>
            <TooltipContent
                side="right"
                :avoid-collisions="true"
                class="z-[60] w-[240px] p-0 border-2 border-[#c8a000] bg-[#0d0a00] shadow-xl rounded-sm"
            >
                <div v-if="equipped" class="px-3 pt-2 pb-1 text-[0.68rem] text-[#8a8272] italic">
                    Currently Equipped
                </div>

                <div class="px-3 pt-2 pb-1 text-[0.9rem] font-bold" :class="nameColor">
                    {{ item.name }}
                </div>

                <div v-if="item.hands || item.type" class="px-3 flex justify-between text-[0.72rem] text-[#c0bba8]">
                    <span>{{ item.type }}</span>
                    <span v-if="item.hands">{{ item.hands === 2 ? 'Two-Hand' : 'One-Hand' }}</span>
                </div>

                <div v-if="item.damage && item.type.toLowerCase() === 'weapon'" class="px-3 py-[2px] text-[0.72rem] text-[#c0bba8]">
                    {{ diceToRange(item.damage) }} Damage
                    <span v-if="item.wait"> (slow)</span>
                </div>

                <div v-if="item.armor" class="px-3 py-[2px] text-[0.72rem] text-[#c0bba8]">
                    {{ item.armor }} Armor
                </div>

                <div v-if="item.element" class="px-3 py-[2px] text-[0.72rem] text-[#ff8844]">
                    {{ item.element }} {{ item.type.toLowerCase() === 'weapon' ? 'Damage' : 'Resist' }}
                </div>

                <div
                    v-for="(val, stat) in item.statmods"
                    :key="stat"
                    class="px-3 py-[1px] text-[0.72rem] font-semibold"
                    :class="val > 0 ? 'text-[#4eff91]' : 'text-[#ff5555]'"
                >
                    {{ val > 0 ? '+' : '' }}{{ val }} {{ capitalize(String(stat)) }}
                </div>

                <div v-if="item.enchant" class="px-3 py-[1px] text-[0.72rem] text-[#88aaff]">
                    Enchantment +{{ item.enchant }}
                </div>

                <div v-if="item.uses" class="px-3 py-[1px] text-[0.72rem] text-[#c0bba8]">
                    {{ item.uses }} charges remaining
                </div>

                <div
                    v-for="d in item.details"
                    :key="d"
                    class="px-3 py-[1px] text-[0.72rem] font-semibold"
                    :class="d === 'cursed' ? 'text-[#ff4444]' : 'text-[#f0c040]'"
                >
                    {{ capitalize(d) }}
                </div>

                <template v-if="item.description">
                    <div class="mx-3 my-1 border-t border-[#c8a000]/30" />
                    <div class="px-3 pb-2 text-[0.68rem] italic text-[#8a8272]">
                        "{{ item.description }}"
                    </div>
                </template>

                <div v-if="item.value" class="px-3 pb-2 text-[0.65rem] text-[#c8a000]">
                    Worth: {{ item.value }}g
                </div>
            </TooltipContent>
        </TooltipRoot>
    </TooltipProvider>
</template>
