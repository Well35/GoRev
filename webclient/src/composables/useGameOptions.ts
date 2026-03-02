import { ref } from 'vue';

export interface RaceOption {
    id: number;
    name: string;
    description: string;
}

let cached: RaceOption[] | null = null;
const loading = ref(false);

export function useGameOptions() {
    const races = ref<RaceOption[]>(cached ?? []);

    async function fetchOnce(): Promise<void> {
        if (cached !== null) {
            races.value = cached;
            return;
        }
        if (loading.value) return;
        loading.value = true;
        try {
            const res = await fetch('/api/game-options');
            if (!res.ok) return;
            const data = await res.json();
            cached = data.races ?? [];
            races.value = cached!;
        } finally {
            loading.value = false;
        }
    }

    fetchOnce();

    return { races };
}
