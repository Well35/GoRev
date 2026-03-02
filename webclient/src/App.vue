<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import TerminalPanel from '@/components/layout/TerminalPanel.vue';
import InputBar from '@/components/layout/InputBar.vue';
import ConnectOverlay from '@/components/ConnectOverlay.vue';
import VitalsPanel from '@/components/panels/VitalsPanel.vue';
import StatsPanel from '@/components/panels/StatsPanel.vue';
import MovementPanel from '@/components/panels/MovementPanel.vue';
import MapPanel from '@/components/panels/MapPanel.vue';
import Button from '@/components/ui/button.vue';
import Tabs from '@/components/ui/tabs.vue';
import TabsList from '@/components/ui/tabs-list.vue';
import TabsTrigger from '@/components/ui/tabs-trigger.vue';
import { useWebSocket } from '@/composables/useWebSocket';
import { useCharStore } from '@/stores/char';
import { useRoomStore } from '@/stores/room';
import type { Direction } from '@/types';

const metaMudName =
    document.querySelector<HTMLMetaElement>('meta[name="gomud-mudname"]')?.content ?? 'GoMud';

const terminalRef = ref<{ write: (d: string) => void; focus: () => void } | null>(null);
const hasConnected = ref(false);
const connecting = ref(false);

const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}//${location.host}/ws`;

const char = useCharStore();
const room = useRoomStore();

const webSocket = useWebSocket(
    wsUrl,
    (data) => {
        terminalRef.value?.write(data);
    },
    (module, payload) => {
        char.handleGMCP(module, payload);
        room.handleGMCP(module, payload);
    }
);

const isConnected = computed(() => webSocket.connected.value);

const handleConnect = () => {
    connecting.value = true;
    webSocket.connect();
    const interval = setInterval(() => {
        if (webSocket.connected.value) {
            connecting.value = false;
            hasConnected.value = true;
            clearInterval(interval);
        }
    }, 100);
};

const handleSend = (cmd: string) => {
    webSocket.send(cmd + '\n');
};

const showOverlay = computed(() => !hasConnected.value || !webSocket.connected.value);

// grid-template-areas can't be expressed as a Tailwind utility
const gridAreas = '"topbar topbar topbar" "left center right"';

// ── Right Panel ──────────────────────────────────────────────────────────────

type EntityType = 'mob' | 'player';

const roomTargets = computed(() => [
    ...room.contents.npcs.map((e) => ({ type: 'mob' as EntityType, entity: e })),
    ...room.contents.players.map((e) => ({ type: 'player' as EntityType, entity: e })),
]);

const selectedTarget = ref<number | null>(null);

const selectedEntity = computed(() =>
    selectedTarget.value !== null ? (roomTargets.value[selectedTarget.value] ?? null) : null
);

// Command-ready target string — first word of name, lowercased
const cmdTarget = computed(() =>
    selectedEntity.value ? ' ' + selectedEntity.value.entity.name.split(' ')[0].toLowerCase() : ''
);

// Clear selection when the target is no longer in the room
watch(roomTargets, (targets) => {
    if (selectedTarget.value !== null && selectedTarget.value >= targets.length) {
        selectedTarget.value = null;
    }
});

// Clear selection when moving to a new room
watch(
    () => room.currentRoomId,
    () => {
        selectedTarget.value = null;
    }
);

const tagClass = (type: EntityType) =>
    ({
        mob: 'text-[#cc4444] border border-[#6a1010] bg-[#1a0000]',
        player: 'text-[var(--accent-blue)] border border-[#005050] bg-[#001414]',
    })[type];

const nameClass = (type: EntityType) =>
    ({
        mob: 'text-[#c8a870]',
        player: 'text-[var(--accent-blue)]',
    })[type];

const arrowKeyMap: Partial<Record<string, Direction>> = {
    ArrowUp: 'north',
    ArrowDown: 'south',
    ArrowLeft: 'west',
    ArrowRight: 'east',
};

let lastMoveSent = 0;
const MOVE_THROTTLE_MS = 250;

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (!isConnected.value) return;
    const dir = arrowKeyMap[e.key];
    if (!dir) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    const now = Date.now();
    if (now - lastMoveSent < MOVE_THROTTLE_MS) return;
    lastMoveSent = now;
    handleSend(dir);
});

const skillTabs = ['Skills', 'Spells'] as const;
type SkillTab = (typeof skillTabs)[number];
const activeSkillTab = ref<SkillTab>('Skills');
</script>

<template>
    <div
        class="grid grid-cols-[260px_1fr_300px] grid-rows-[44px_1fr] h-full overflow-hidden bg-[var(--bg-app)] relative"
        :style="{ gridTemplateAreas: gridAreas }"
    >
        <!-- Top Bar -->
        <div
            class="[grid-area:topbar] flex items-center px-3 bg-[var(--bg-panel-header)] border-b border-[var(--border-panel)] h-11 shrink-0"
        >
            <div class="[flex:0_0_260px]">
                <span
                    class="text-[var(--accent-blue)] font-bold text-base tracking-[0.08em] uppercase"
                    >{{ metaMudName }}</span
                >
            </div>
            <div class="flex-1 text-center text-[var(--text-primary)] text-sm">
                <span>{{ room.currentRoom?.name ?? '' }}</span>
            </div>
            <div class="[flex:0_0_300px] flex items-center justify-end gap-[10px]">
                <span
                    class="text-[var(--text-secondary)] text-[0.82rem] py-[2px] px-[9px] bg-[#131f30] border border-[var(--border-panel)]"
                    >141ms</span
                >
                <span
                    class="text-[var(--text-secondary)] text-[0.82rem] py-[2px] px-[9px] bg-[#131f30] border border-[var(--border-panel)]"
                    >2 online</span
                >
                <span
                    class="w-2 h-2 rounded-full shrink-0"
                    :class="
                        isConnected ? 'bg-[#22c55e] shadow-[0_0_5px_#22c55e80]' : 'bg-[#ef444480]'
                    "
                />
            </div>
        </div>

        <!-- Left Panel -->
        <div
            class="[grid-area:left] flex flex-col overflow-y-auto overflow-x-hidden bg-[var(--bg-panel)] border-r border-[var(--border-panel)]"
        >
            <VitalsPanel />
            <StatsPanel />
            <MovementPanel @move="handleSend" />
        </div>

        <!-- Center Column -->
        <div class="[grid-area:center] flex flex-col overflow-hidden">
            <TerminalPanel ref="terminalRef" />
            <InputBar :disabled="!isConnected" @send="handleSend" />
        </div>

        <!-- Right Panel -->
        <div
            class="[grid-area:right] flex flex-col bg-[var(--bg-panel)] border-l border-[var(--border-panel)] overflow-hidden"
        >
            <!-- Map Section -->
            <div class="shrink-0 border-b border-[var(--border-panel)]">
                <div
                    class="bg-[var(--bg-panel-header)] border-b border-[var(--border-panel)] px-2 py-1 flex justify-between items-center"
                >
                    <span
                        class="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                        >Game Map</span
                    >
                    <span class="text-[0.75rem] text-[var(--accent-blue)] tracking-[0.03em]">{{
                        room.currentRoom?.area ?? ''
                    }}</span>
                </div>
                <div class="w-[calc(100%-20px)] h-[150px] mx-auto my-[6px]">
                    <MapPanel />
                </div>
                <div
                    class="text-center text-[0.82rem] pt-[2px] pb-[7px] truncate px-2"
                    :class="
                        selectedEntity
                            ? 'text-[var(--accent-blue)]'
                            : 'text-[var(--text-secondary)]'
                    "
                >
                    {{ selectedEntity ? selectedEntity.entity.name : 'No Target' }}
                </div>
            </div>

            <!-- Room Targets Section -->
            <div class="shrink-0 border-b border-[var(--border-panel)]">
                <div
                    class="bg-[var(--bg-panel-header)] border-b border-[var(--border-panel)] px-2 py-1 flex justify-between items-center"
                >
                    <span
                        class="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]"
                        >Room Targets</span
                    >
                    <Button variant="ghost" class="text-[0.78rem] p-0">[+]</Button>
                </div>
                <div class="py-[2px] max-h-[190px] overflow-y-auto">
                    <div
                        v-if="roomTargets.length === 0"
                        class="px-2 py-2 text-[0.75rem] text-[var(--text-secondary)] italic"
                    >
                        No one here
                    </div>
                    <div
                        v-for="(entry, i) in roomTargets"
                        :key="entry.entity.id + i"
                        class="flex flex-col gap-[3px] px-2 pt-[3px] pb-1 cursor-pointer border-l-2 border-l-transparent text-[0.75rem] transition-[background-color,border-left-color] duration-100 hover:bg-[rgba(0,192,176,0.07)] hover:border-l-[var(--accent-blue)]"
                        :class="
                            selectedTarget === i
                                ? 'bg-[rgba(0,192,176,0.13)] border-l-[var(--accent-blue)]'
                                : ''
                        "
                        @click="selectedTarget = i"
                    >
                        <div class="flex items-center gap-[6px]">
                            <span
                                class="text-[0.62rem] font-bold tracking-[0.06em] px-1 py-px shrink-0 font-mono"
                                :class="tagClass(entry.type)"
                                >{{ entry.type === 'player' ? 'PC' : 'MOB' }}</span
                            >
                            <span :class="nameClass(entry.type)" class="truncate">{{
                                entry.entity.name
                            }}</span>
                            <span
                                v-if="entry.entity.aggro"
                                class="ml-auto text-[0.6rem] text-[#cc4444] shrink-0"
                                >!</span
                            >
                        </div>
                        <div v-if="entry.type === 'mob'" class="h-[2px] bg-[#0a1a0a] w-full">
                            <div
                                class="h-full transition-[width] duration-200 bg-[#aa2020]"
                                :style="{ width: entry.entity.hp_pct + '%' }"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Skills / Spells Section -->
            <Tabs v-model="activeSkillTab" class="flex-1 flex flex-col overflow-hidden min-h-0">
                <TabsList>
                    <TabsTrigger
                        v-for="tab in skillTabs"
                        :key="tab"
                        :value="tab"
                        :model-value="activeSkillTab"
                        @update:model-value="activeSkillTab = $event"
                    >
                        {{ tab }}
                    </TabsTrigger>
                </TabsList>
                <div class="flex-1 overflow-y-auto py-[5px] px-2">
                    <template v-if="activeSkillTab === 'Skills'">
                        <div
                            v-if="char.skills.length === 0"
                            class="text-[var(--text-secondary)] text-[0.78rem] text-center py-[14px]"
                        >
                            No skills learned
                        </div>
                        <div
                            v-for="skill in char.skills"
                            :key="skill.id"
                            class="flex items-center justify-between py-[3px] text-[0.78rem]"
                        >
                            <span class="text-[var(--text-primary)]">{{ skill.name }}</span>
                            <span class="text-[var(--text-secondary)] font-mono shrink-0"
                                >{{ skill.level }}/4</span
                            >
                        </div>
                    </template>
                    <template v-else>
                        <div
                            v-if="char.spells.length === 0"
                            class="text-[var(--text-secondary)] text-[0.78rem] text-center py-[14px]"
                        >
                            No spells learned
                        </div>
                        <Button
                            v-for="spell in char.spells"
                            :key="spell.id"
                            :disabled="!isConnected"
                            variant="ghost"
                            class="w-full flex items-center justify-start gap-2 px-2 py-[3px] h-auto text-[0.78rem] border-l-2 border-l-transparent rounded-none hover:bg-[rgba(0,192,176,0.07)] hover:border-l-[var(--accent-blue)]"
                            :title="spell.description"
                            @click="handleSend('cast ' + spell.id + cmdTarget)"
                        >
                            <span class="text-[var(--accent-blue)] font-mono shrink-0"
                                >{{ spell.cost }}mp</span
                            >
                            <span class="text-[var(--text-primary)] truncate">{{
                                spell.name
                            }}</span>
                        </Button>
                    </template>
                </div>
            </Tabs>

            <!-- Quick-access window buttons -->
            <div
                class="shrink-0 border-t border-[var(--border-panel)] pt-[6px] px-2 pb-2 bg-[var(--bg-panel)]"
            >
                <div class="grid grid-cols-2 gap-1">
                    <Button size="sm">Inventory</Button>
                    <Button size="sm">Equipment</Button>
                    <Button size="sm">Talents</Button>
                    <Button size="sm">Who Online</Button>
                    <Button size="sm">Examine</Button>
                    <Button size="sm">Quest Log</Button>
                    <Button size="sm">Guild</Button>
                    <Button size="sm">Settings</Button>
                </div>
            </div>
        </div>

        <ConnectOverlay
            v-if="showOverlay"
            :mud-name="metaMudName"
            :connecting="connecting"
            @connect="handleConnect"
        />
    </div>
</template>
