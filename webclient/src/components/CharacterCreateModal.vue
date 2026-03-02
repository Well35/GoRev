<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useGameOptions } from '@/composables/useGameOptions';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';

const emit = defineEmits<{ close: [] }>();

const auth = useAuthStore();
const { races } = useGameOptions();

const name = ref('');
const selectedRaceId = ref<number | null>(null);
const loading = ref(false);

async function handleSubmit() {
    if (!name.value || selectedRaceId.value === null) return;
    loading.value = true;
    await auth.createCharacter(name.value, selectedRaceId.value);
    loading.value = false;
    if (!auth.error) {
        emit('close');
    }
}
</script>

<template>
    <div
        class="absolute inset-0 z-60 flex items-center justify-center bg-[rgba(2,8,16,0.85)]"
        @click.self="emit('close')"
    >
        <div
            class="flex flex-col gap-4 py-7 px-8 bg-[var(--bg-panel)] border border-[var(--border-panel)] w-[360px]"
        >
            <div class="flex items-center justify-between">
                <span class="text-[0.85rem] font-bold text-[var(--text-primary)] uppercase tracking-[0.08em]">
                    Create Character
                </span>
                <button
                    class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg leading-none"
                    @click="emit('close')"
                >×</button>
            </div>

            <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
                <div class="flex flex-col gap-1">
                    <label class="text-[0.75rem] text-[var(--text-secondary)] uppercase tracking-[0.06em]">
                        Character Name
                    </label>
                    <Input
                        v-model="name"
                        :disabled="loading"
                        placeholder="Enter character name"
                    />
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[0.75rem] text-[var(--text-secondary)] uppercase tracking-[0.06em]">
                        Race
                    </label>
                    <div class="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1">
                        <div
                            v-if="races.length === 0"
                            class="text-[0.78rem] text-[var(--text-secondary)] italic py-2"
                        >
                            Loading races…
                        </div>
                        <button
                            v-for="race in races"
                            :key="race.id"
                            type="button"
                            class="text-left px-3 py-2 text-[0.8rem] border transition-colors"
                            :class="
                                selectedRaceId === race.id
                                    ? 'border-[var(--accent-blue)] bg-[rgba(0,192,176,0.1)] text-[var(--text-primary)]'
                                    : 'border-[var(--border-panel)] bg-[#061414] text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]'
                            "
                            @click="selectedRaceId = race.id"
                        >
                            <span class="font-semibold">{{ race.name }}</span>
                            <span v-if="race.description" class="block text-[0.72rem] mt-0.5 opacity-70">
                                {{ race.description }}
                            </span>
                        </button>
                    </div>
                </div>

                <div
                    v-if="auth.error"
                    class="text-[0.78rem] text-[#ef4444] bg-[#1a0000] border border-[#6a1010] px-3 py-2"
                >
                    {{ auth.error }}
                </div>

                <div class="flex gap-2 mt-1">
                    <Button
                        type="button"
                        variant="ghost"
                        class="flex-1 py-[8px] text-[0.85rem] uppercase tracking-[0.06em]"
                        @click="emit('close')"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        :disabled="loading || !name || selectedRaceId === null"
                        class="flex-1 py-[8px] text-[0.85rem] font-bold uppercase tracking-[0.06em]"
                    >
                        {{ loading ? '...' : 'Create' }}
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>
