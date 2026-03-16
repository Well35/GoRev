<script setup lang="ts">
import { ref, computed } from 'vue';
import Dialog from '@/components/ui/dialog.vue';
import ItemTooltip from '@/components/ui/ItemTooltip.vue';
import { useCharStore } from '@/stores/char';
import type { InventoryItem, WornSlotKey } from '@/stores/char';

const props = defineProps<{ onCommand: (cmd: string) => void }>();
const emit = defineEmits<{ close: [] }>();

const char = useCharStore();

const SLOTS: { key: WornSlotKey; label: string; row: number; col: 1 | 2 | 3 }[] = [
    { key: 'head',    label: 'Head',  row: 1, col: 2 },
    { key: 'neck',    label: 'Neck',  row: 2, col: 2 },
    { key: 'gloves',  label: 'Hands', row: 3, col: 1 },
    { key: 'body',    label: 'Body',  row: 3, col: 2 },
    { key: 'ring',    label: 'Ring',  row: 3, col: 3 },
    { key: 'belt',    label: 'Belt',  row: 4, col: 2 },
    { key: 'weapon',  label: 'Main',  row: 5, col: 1 },
    { key: 'legs',    label: 'Legs',  row: 5, col: 2 },
    { key: 'offhand', label: 'Off',   row: 5, col: 3 },
    { key: 'feet',    label: 'Feet',  row: 6, col: 2 },
];

const draggingItem = ref<InventoryItem | null>(null);
const dragOverSlot = ref<WornSlotKey | null>(null);
const draggingSlot = ref<WornSlotKey | null>(null);
const backpackDragOver = ref(false);

function onDragStart(item: InventoryItem) { draggingItem.value = item; }
function onDragStartSlot(key: WornSlotKey) { draggingSlot.value = key; }
function onDragEnd() { draggingItem.value = null; dragOverSlot.value = null; draggingSlot.value = null; backpackDragOver.value = false; }
function onDropOnSlot(key: WornSlotKey) {
    if (draggingItem.value) props.onCommand(`wear ${draggingItem.value.id}`);
    draggingItem.value = null;
    dragOverSlot.value = null;
}
function onDropOnBackpack() {
    if (draggingSlot.value) {
        const itemName = char.worn[draggingSlot.value].name;
        if (itemName) props.onCommand(`remove ${itemName}`);
    }
    draggingSlot.value = null;
    backpackDragOver.value = false;
}

const capacityPct = computed(() => {
    const { count, max } = char.backpack.Summary;
    return max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;
});

function typeBadgeClass(type: string) {
    const t = type.toLowerCase();
    if (t === 'weapon') return 'border-[#cc8844] text-[#cc8844] bg-[#180e00]';
    if (t === 'armor') return 'border-[#4488cc] text-[#4488cc] bg-[#001018]';
    return 'border-[var(--border-panel)] text-[var(--text-muted)] bg-[var(--bg-app)]';
}

function detailBadgeClass(detail: string) {
    const d = detail.toLowerCase();
    if (d === 'cursed') return 'border-[#cc4444] text-[#cc4444] bg-[#1a0000]';
    if (d === 'quest') return 'border-[#f0c040] text-[#f0c040] bg-[#1a1400]';
    return 'border-[var(--border-panel)] text-[var(--text-muted)] bg-[var(--bg-app)]';
}
</script>

<template>
    <Dialog title="Inventory" @close="emit('close')">
        <div class="flex flex-1 overflow-hidden min-h-0">

            <!-- LEFT: Equipment panel -->
            <div class="relative flex-shrink-0 w-[310px] border-r border-[var(--border-panel)] bg-[var(--bg-app)]">
                <!-- Character silhouette SVG (decorative) -->
                <svg
                    viewBox="0 0 100 160"
                    xmlns="http://www.w3.org/2000/svg"
                    class="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <!-- head -->
                    <circle cx="50" cy="18" r="12" fill="currentColor" />
                    <!-- neck -->
                    <rect x="46" y="30" width="8" height="8" fill="currentColor" />
                    <!-- torso -->
                    <rect x="30" y="38" width="40" height="45" rx="3" fill="currentColor" />
                    <!-- belt -->
                    <rect x="30" y="79" width="40" height="7" rx="1" fill="currentColor" />
                    <!-- upper arms -->
                    <rect x="14" y="38" width="14" height="32" rx="5" fill="currentColor" />
                    <rect x="72" y="38" width="14" height="32" rx="5" fill="currentColor" />
                    <!-- lower arms / hands -->
                    <rect x="10" y="70" width="12" height="22" rx="4" fill="currentColor" />
                    <rect x="78" y="70" width="12" height="22" rx="4" fill="currentColor" />
                    <!-- legs -->
                    <rect x="31" y="86" width="17" height="50" rx="4" fill="currentColor" />
                    <rect x="52" y="86" width="17" height="50" rx="4" fill="currentColor" />
                    <!-- feet -->
                    <rect x="28" y="134" width="22" height="10" rx="3" fill="currentColor" />
                    <rect x="50" y="134" width="22" height="10" rx="3" fill="currentColor" />
                </svg>

                <!-- 3-col × 6-row CSS grid for slot chips -->
                <div class="relative z-10 grid grid-cols-3 grid-rows-6 h-full p-3 gap-2">
                    <div
                        v-for="slot in SLOTS"
                        :key="slot.key"
                        :style="{ gridRow: slot.row, gridColumn: slot.col }"
                        class="flex items-center justify-center"
                        @dragover.prevent="dragOverSlot = slot.key"
                        @dragleave="dragOverSlot = null"
                        @drop.prevent="onDropOnSlot(slot.key)"
                    >
                        <div
                            class="w-full flex flex-col items-center gap-[2px]"
                            :class="{ 'ring-1 ring-[var(--accent-blue)] rounded': dragOverSlot === slot.key }"
                        >
                            <span class="text-[0.62rem] tracking-[0.1em] font-mono font-bold text-[var(--text-muted)] uppercase">
                                {{ slot.label }}
                            </span>
                            <ItemTooltip v-if="char.worn[slot.key].id" :item="char.worn[slot.key]" :equipped="true">
                                <div
                                    class="w-full min-h-[44px] flex items-center justify-center px-1 py-1 text-center transition-colors rounded bg-[#061a1a] border border-[var(--border-panel)] text-[var(--text-primary)] hover:border-[var(--accent-blue)] hover:bg-[#0a2424] cursor-grab active:cursor-grabbing"
                                    draggable="true"
                                    @dragstart="onDragStartSlot(slot.key)"
                                    @dragend="onDragEnd"
                                >
                                    <span class="text-[0.75rem] leading-tight">{{ char.worn[slot.key].name }}</span>
                                </div>
                            </ItemTooltip>
                            <div
                                v-else
                                class="w-full min-h-[44px] flex items-center justify-center px-1 py-1 text-center transition-colors rounded bg-[#030d0d] border border-dashed border-[var(--text-muted)] text-[var(--text-muted)] cursor-default"
                            >
                                <span class="text-[0.65rem] opacity-40">—</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Backpack list -->
            <div class="flex-1 flex flex-col overflow-hidden min-h-0">
                <!-- Capacity header -->
                <div class="px-4 py-2 border-b border-[var(--border-panel)] flex items-center gap-3 shrink-0 bg-[var(--bg-panel-header)]">
                    <span class="text-[0.8rem] font-bold tracking-[0.08em] uppercase text-[var(--text-secondary)]">Backpack</span>
                    <span class="font-mono text-[0.85rem] text-[var(--accent-blue)]">
                        {{ char.backpack.Summary.count }} / {{ char.backpack.Summary.max }}
                    </span>
                    <div class="flex-1 h-[3px] bg-[#061414] rounded overflow-hidden">
                        <div
                            class="h-full bg-[var(--accent-blue)] transition-[width]"
                            :style="{ width: capacityPct + '%' }"
                        />
                    </div>
                </div>

                <!-- Item list -->
                <div
                    class="flex-1 overflow-y-auto px-2 py-1 transition-colors"
                    :class="{ 'bg-[rgba(0,192,176,0.04)]': backpackDragOver }"
                    @dragover.prevent="backpackDragOver = !!draggingSlot.value"
                    @dragleave="backpackDragOver = false"
                    @drop.prevent="onDropOnBackpack"
                >
                    <div
                        v-if="!char.backpack.items.length"
                        class="text-center text-[0.9rem] text-[var(--text-secondary)] italic py-10"
                    >
                        Backpack is empty
                    </div>
                    <ItemTooltip
                        v-for="item in char.backpack.items"
                        :key="item.id"
                        :item="item"
                        :equipped="false"
                    >
                        <div
                            draggable="true"
                            @dragstart="onDragStart(item)"
                            @dragend="onDragEnd"
                            @click="props.onCommand(`wear ${item.id}`)"
                            class="flex items-center gap-2 px-2 py-[6px] border-b border-[var(--border-panel)] last:border-b-0 cursor-grab active:cursor-grabbing hover:bg-[rgba(0,192,176,0.06)] transition-colors"
                            :class="{ 'opacity-50': draggingItem?.id === item.id }"
                        >
                            <span class="text-[var(--text-muted)] text-[0.8rem] shrink-0 select-none">⠿</span>
                            <span class="flex-1 text-[0.9rem] text-[var(--text-primary)] truncate">{{ item.name }}</span>
                            <span
                                v-if="item.type"
                                class="text-[0.7rem] font-bold font-mono px-[5px] py-px border shrink-0"
                                :class="typeBadgeClass(item.type)"
                            >{{ item.type.toUpperCase() }}</span>
                            <span
                                v-for="d in item.details"
                                :key="d"
                                class="text-[0.68rem] font-bold font-mono px-[5px] py-px border shrink-0"
                                :class="detailBadgeClass(d)"
                            >{{ d.toUpperCase() }}</span>
                        </div>
                    </ItemTooltip>
                </div>

                <!-- Hint footer -->
                <div class="px-4 py-2 border-t border-[var(--border-panel)] shrink-0 bg-[var(--bg-panel-header)]">
                    <span class="text-[0.7rem] text-[var(--text-muted)] italic">
                        drag item → slot to equip · drag slot → here to unequip · click item to wear
                    </span>
                </div>
            </div>

        </div>
    </Dialog>
</template>
