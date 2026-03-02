<script setup lang="ts">
import { computed } from 'vue';
import { useCharStore } from '@/stores/char';

const char = useCharStore();

const pct = (cur: number, max: number) =>
    max > 0 ? Math.min(100, Math.max(0, (cur / max) * 100)) : 0;

const hpPct = computed(() => pct(char.hp, char.hpMax));
const spPct = computed(() => pct(char.sp, char.spMax));
const xpPct = computed(() => pct(char.xp, char.tnl));

const hpLabel = computed(() =>
    char.hpMax > 0 ? `${char.hp.toLocaleString()} / ${char.hpMax.toLocaleString()}` : '-- / --'
);
const spLabel = computed(() =>
    char.spMax > 0 ? `${char.sp.toLocaleString()} / ${char.spMax.toLocaleString()}` : '-- / --'
);
const xpLabel = computed(() =>
    char.tnl > 0 ? `${char.xp.toLocaleString()} / ${char.tnl.toLocaleString()}` : '-- / --'
);
</script>

<template>
    <div class="border-b border-[var(--border-panel)]">
        <div
            class="bg-[var(--bg-panel-header)] border-b border-[var(--border-panel)] py-[7px] px-[10px] text-[1.05rem] font-bold text-[var(--text-primary)] text-center tracking-[0.04em]"
        >
            {{ char.name || 'Adventurer' }}
        </div>
        <div class="py-[10px] px-3 flex flex-col gap-[9px]">
            <div class="flex flex-col gap-1">
                <div class="text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                    HP
                </div>
                <div
                    class="relative h-[22px] overflow-hidden rounded-none"
                    style="background-color: var(--color-hp-bg)"
                >
                    <div
                        class="absolute top-0 left-0 h-full rounded-none transition-[width] duration-300"
                        :style="{ width: hpPct + '%', backgroundColor: 'var(--color-hp)' }"
                    />
                    <span
                        class="bar-value absolute right-[7px] top-1/2 -translate-y-1/2 text-[0.78rem] text-[#f0f4fa] font-mono z-[1] leading-none whitespace-nowrap"
                        >{{ hpLabel }}</span
                    >
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <div class="text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                    Mana
                </div>
                <div
                    class="relative h-[22px] overflow-hidden rounded-none"
                    style="background-color: var(--color-mana-bg)"
                >
                    <div
                        class="absolute top-0 left-0 h-full rounded-none transition-[width] duration-300"
                        :style="{ width: spPct + '%', backgroundColor: 'var(--color-mana)' }"
                    />
                    <span
                        class="bar-value absolute right-[7px] top-1/2 -translate-y-1/2 text-[0.78rem] text-[#f0f4fa] font-mono z-[1] leading-none whitespace-nowrap"
                        >{{ spLabel }}</span
                    >
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <div class="text-[0.8rem] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                    Experience
                </div>
                <div
                    class="relative h-[22px] overflow-hidden rounded-none"
                    style="background-color: var(--color-exp-bg)"
                >
                    <div
                        class="absolute top-0 left-0 h-full rounded-none transition-[width] duration-300"
                        :style="{ width: xpPct + '%', backgroundColor: 'var(--color-exp)' }"
                    />
                    <span
                        class="bar-value absolute right-[7px] top-1/2 -translate-y-1/2 text-[0.78rem] text-[#f0f4fa] font-mono z-[1] leading-none whitespace-nowrap"
                        >{{ xpLabel }}</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bar-value {
    text-shadow: 0 1px 3px #0008;
}
</style>
