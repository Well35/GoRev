import { defineStore } from 'pinia';
import { ref } from 'vue';

export type AuthState = 'login' | 'character-select' | 'playing';

export interface CharacterSummary {
    name: string;
    race: string;
    level: number;
}

export const useAuthStore = defineStore('auth', () => {
    const state = ref<AuthState>('login');
    const token = ref<string | null>(null);
    const characters = ref<CharacterSummary[]>([]);
    const selectedChar = ref<string | null>(null);
    const error = ref<string | null>(null);

    async function login(username: string, password: string): Promise<void> {
        error.value = null;
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            error.value = data.error ?? 'Login failed';
            return;
        }
        token.value = data.token;
        characters.value = data.characters ?? [];
        state.value = 'character-select';
    }

    async function register(username: string, password: string): Promise<void> {
        error.value = null;
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) {
            error.value = data.error ?? 'Registration failed';
            return;
        }
        token.value = data.token;
        characters.value = [];
        state.value = 'character-select';
    }

    async function loadCharacters(): Promise<void> {
        if (!token.value) return;
        const res = await fetch('/api/characters', {
            headers: { Authorization: `Bearer ${token.value}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        characters.value = data.characters ?? [];
    }

    async function createCharacter(name: string, raceId: number): Promise<void> {
        error.value = null;
        if (!token.value) return;
        const res = await fetch('/api/characters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.value}`,
            },
            body: JSON.stringify({ name, race_id: raceId }),
        });
        const data = await res.json();
        if (!res.ok) {
            error.value = data.error ?? 'Failed to create character';
            return;
        }
        characters.value = data.characters ?? [];
    }

    function selectCharacter(name: string): void {
        selectedChar.value = name;
        state.value = 'playing';
    }

    function reset(): void {
        state.value = 'login';
        token.value = null;
        characters.value = [];
        selectedChar.value = null;
        error.value = null;
    }

    return {
        state,
        token,
        characters,
        selectedChar,
        error,
        login,
        register,
        loadCharacters,
        createCharacter,
        selectCharacter,
        reset,
    };
});
