import { ref } from 'vue';

export interface RaceOption {
    id: number;
    name: string;
    description: string;
}

export interface ClassOption {
    id: number;
    name: string;
    description: string;
}

let cachedRaces: RaceOption[] | null = null;
let cachedClasses: ClassOption[] | null = null;
const loading = ref(false);

export function useGameOptions() {
    const races = ref<RaceOption[]>(cachedRaces ?? []);
    const classes = ref<ClassOption[]>(cachedClasses ?? []);

    async function fetchOnce(): Promise<void> {
        if (cachedRaces !== null) {
            races.value = cachedRaces;
            classes.value = cachedClasses ?? [];
            return;
        }
        if (loading.value) return;
        loading.value = true;
        try {
            const res = await fetch('/api/game-options');
            if (!res.ok) return;
            const data = await res.json();
            cachedRaces = data.races ?? [];
            cachedClasses = data.classes ?? [];
            races.value = cachedRaces!;
            classes.value = cachedClasses!;
        } finally {
            loading.value = false;
        }
    }

    fetchOnce();

    return { races, classes };
}
