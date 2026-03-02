import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';

export interface RoomData {
    id: number;
    name: string;
    area: string;
    environment: string;
    color: string;
    x: number;
    y: number;
    z: number;
    exits: Record<string, number>; // direction → roomId
}

export interface RoomContentsCharacter {
    id: string;
    name: string;
    adjectives: string[];
    aggro: boolean;
    quest_flag: boolean;
    hp_pct: number;
}

interface RoomContentsPayload {
    Players: RoomContentsCharacter[];
    Npcs: RoomContentsCharacter[];
}

interface RoomInfoPayload {
    num?: number;
    name?: string;
    area?: string;
    environment?: string;
    color?: string;
    coords?: string;
    exitsv2?: Record<string, { num: number; dx: number; dy: number; dz: number; details: string[] }>;
    Contents?: RoomContentsPayload;
}

interface RoomMapRoom {
    num: number;
    x: number;
    y: number;
    z: number;
    color: string;
    exits: Record<string, number>;
}

function parseCoords(s: string): { x: number; y: number; z: number } | null {
    // Format: "ZoneName, x, y, z" — zone name may contain commas
    const parts = s.split(', ');
    if (parts.length < 4) return null;
    const z = parseInt(parts[parts.length - 1], 10);
    const y = parseInt(parts[parts.length - 2], 10);
    const x = parseInt(parts[parts.length - 3], 10);
    if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
    // Reject Go's sentinel value for rooms with no coordinate data
    if (Math.abs(x) > 99999 || Math.abs(y) > 99999) return null;
    return { x, y, z };
}

export const useRoomStore = defineStore('room', () => {
    const currentRoomId = ref(0);
    // Plain reactive object — straightforward reactivity for keyed lookups
    const rooms = reactive<Record<number, RoomData>>({});
    const contents = reactive<{ players: RoomContentsCharacter[]; npcs: RoomContentsCharacter[] }>({
        players: [],
        npcs: [],
    });

    const currentRoom = computed<RoomData | null>(() =>
        currentRoomId.value > 0 ? rooms[currentRoomId.value] ?? null : null
    );

    function applyRoomMap(data: RoomMapRoom[]) {
        // Replace the rooms dict wholesale with a fresh batch from the server
        for (const key of Object.keys(rooms)) {
            delete rooms[Number(key)];
        }
        for (const r of data) {
            rooms[r.num] = {
                id: r.num,
                name: '',
                area: '',
                environment: '',
                color: r.color,
                x: r.x,
                y: r.y,
                z: r.z,
                exits: r.exits,
            };
        }
    }

    function applyRoomInfo(data: RoomInfoPayload) {
        if (!data.num) return;

        const coords = parseCoords(data.coords ?? '');
        if (!coords) return;

        const exits: Record<string, number> = {};
        for (const [dir, exit] of Object.entries(data.exitsv2 ?? {})) {
            exits[dir] = exit.num;
        }

        // Merge into existing room entry (Room.Map may have already created it)
        if (rooms[data.num]) {
            rooms[data.num].name = data.name ?? '';
            rooms[data.num].area = data.area ?? '';
            rooms[data.num].environment = data.environment ?? '';
            if (data.color) rooms[data.num].color = data.color;
            rooms[data.num].exits = exits;
        } else {
            rooms[data.num] = {
                id: data.num,
                name: data.name ?? '',
                area: data.area ?? '',
                environment: data.environment ?? '',
                color: data.color ?? '',
                ...coords,
                exits,
            };
        }

        currentRoomId.value = data.num;

        contents.players = data.Contents?.Players ?? [];
        contents.npcs = data.Contents?.Npcs ?? [];
    }

    function handleGMCP(module: string, payload: unknown) {
        if (module === 'Room.Info') {
            applyRoomInfo(payload as RoomInfoPayload);
        } else if (module === 'Room.Map') {
            applyRoomMap(payload as RoomMapRoom[]);
        } else if (module === 'Room.Info.Contents.Npcs') {
            contents.npcs = (payload as RoomContentsCharacter[]) ?? [];
        }
    }

    return { currentRoomId, rooms, currentRoom, contents, handleGMCP };
});
