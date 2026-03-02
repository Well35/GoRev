<script setup lang="ts">
import { computed } from 'vue';
import { useCharStore } from '@/stores/char';

const char = useCharStore();

const classLine = computed(() => {
    const parts = [char.race, char.charClass].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
});
</script>

<template>
    <div class="border-b border-[var(--border-panel)]">
        <div
            class="bg-[var(--bg-panel-header)] border-b border-[var(--border-panel)] py-[5px] px-[10px] text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
        >
            Character Statistics
        </div>
        <div class="pt-[6px] px-[10px] pb-[10px] flex flex-col gap-px">
            <div
                class="text-[0.82rem] text-[var(--text-primary)] font-semibold text-center pb-[6px]"
            >
                {{ classLine }}
            </div>
            <div
                class="text-[0.9rem] font-bold text-[var(--accent-blue)] text-center py-[4px] pb-[2px] tracking-[0.05em]"
            >
                {{ char.level > 0 ? `Level ${char.level}` : '—' }}
            </div>

            <div
                class="text-[0.78rem] font-bold text-[var(--text-primary)] pt-[7px] pb-[3px] border-b border-[var(--border-panel)] mb-[3px]"
            >
                Statistics
            </div>

            <div class="stat-line">
                <span class="sname">Exp:</span>
                <span class="sval">{{ char.xp > 0 ? char.xp.toLocaleString() : '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">For Level:</span>
                <span class="sval">{{ char.tnl > 0 ? char.tnl.toLocaleString() : '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Strength:</span>
                <span class="sval">{{ char.strength || '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Speed:</span>
                <span class="sval">{{ char.speed || '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Smarts:</span>
                <span class="sval">{{ char.smarts || '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Vitality:</span>
                <span class="sval">{{ char.vitality || '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Mysticism:</span>
                <span class="sval">{{ char.mysticism || '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Perception:</span>
                <span class="sval">{{ char.perception || '—' }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Gold:</span>
                <span class="sval text-[#f0c040]">{{
                    char.gold > 0 ? char.gold.toLocaleString() : '0'
                }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Skill Pts:</span>
                <span class="sval">{{ char.skillPoints }}</span>
            </div>
            <div class="stat-line">
                <span class="sname">Train Pts:</span>
                <span class="sval">{{ char.trainingPoints }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stat-line {
    display: flex;
    align-items: baseline;
    font-size: 0.8rem;
    line-height: 1.55;
}

.sname {
    color: var(--text-secondary);
    min-width: 110px;
    flex-shrink: 0;
}

.sval {
    color: var(--text-primary);
}
</style>
