<script setup lang="ts">
import { computed } from 'vue';
import { useRoomStore } from '@/stores/room';

const room = useRoomStore();

const CELL = 12;  // room tile size
const STEP = 14;  // center-to-center (2px gap between tile edges)
const RX = 8;
const RY = 5;

const viewBox = computed(() => {
    const cur = room.currentRoom;
    if (!cur) return `0 0 ${(RX * 2 + 1) * STEP} ${(RY * 2 + 1) * STEP}`;
    const cx = cur.x * STEP;
    const cy = cur.y * STEP;
    const w = (RX * 2 + 1) * STEP;
    const h = (RY * 2 + 1) * STEP;
    return `${cx - w / 2} ${cy - h / 2} ${w} ${h}`;
});

const curZ = computed(() => room.currentRoom?.z ?? 0);

const visibleRooms = computed(() => {
    const cur = room.currentRoom;
    if (!cur) return [];
    return Object.values(room.rooms).filter(r =>
        r.z === curZ.value &&
        Math.abs(r.x - cur.x) <= RX + 1 &&
        Math.abs(r.y - cur.y) <= RY + 1
    );
});

// Fast position → room lookup
const roomByPos = computed(() => {
    const map = new Map<string, typeof visibleRooms.value[0]>();
    for (const r of visibleRooms.value) map.set(`${r.x},${r.y}`, r);
    return map;
});

// Wall segments between adjacent rooms with no connecting exit.
// Only check east + south per room so each pair is processed once.
const walls = computed(() => {
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const pos = roomByPos.value;
    const h = CELL / 2;
    const mid = CELL / 2 + (STEP - CELL) / 2; // center of the gap

    for (const r of visibleRooms.value) {
        const rx = r.x * STEP;
        const ry = r.y * STEP;
        const exits = new Set(Object.values(r.exits));

        // East wall
        const east = pos.get(`${r.x + 1},${r.y}`);
        if (east && !exits.has(east.id)) {
            const wx = rx + mid;
            segs.push({ x1: wx, y1: ry - h, x2: wx, y2: ry + h });
        }

        // South wall
        const south = pos.get(`${r.x},${r.y + 1}`);
        if (south && !exits.has(south.id)) {
            const wy = ry + mid;
            segs.push({ x1: rx - h, y1: wy, x2: rx + h, y2: wy });
        }
    }
    return segs;
});

const CURRENT_COLOR  = '#00c0b0';
const FALLBACK_COLOR = '#2a3040';

function roomColor(r: typeof visibleRooms.value[0]) {
    if (r.id === room.currentRoomId) return CURRENT_COLOR;
    return r.color || FALLBACK_COLOR;
}
</script>

<template>
    <svg
        v-if="room.currentRoom"
        :viewBox="viewBox"
        preserveAspectRatio="xMidYMid meet"
        class="w-full h-full"
    >
        <!-- Room tiles -->
        <rect
            v-for="r in visibleRooms"
            :key="r.id"
            :x="r.x * STEP - CELL / 2"
            :y="r.y * STEP - CELL / 2"
            :width="CELL"
            :height="CELL"
            :fill="roomColor(r)"
        />
        <!-- Wall borders between unconnected adjacent rooms -->
        <line
            v-for="(w, i) in walls"
            :key="i"
            :x1="w.x1" :y1="w.y1"
            :x2="w.x2" :y2="w.y2"
            stroke="#050505"
            stroke-width="3"
            stroke-linecap="square"
        />
    </svg>
    <div
        v-else
        class="w-full h-full flex items-center justify-center text-[var(--text-secondary)] text-xs"
    >
        No map data
    </div>
</template>
