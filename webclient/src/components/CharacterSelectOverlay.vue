<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/button.vue';
import CharacterCreateModal from '@/components/CharacterCreateModal.vue';

const auth = useAuthStore();
const showCreate = ref(false);
</script>

<template>
    <div class="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(2,8,16,0.92)]">
        <div
            class="flex flex-col gap-4 py-8 px-10 bg-[var(--bg-panel)] border border-[var(--border-panel)] w-[400px] max-h-[80vh]"
        >
            <div class="text-center">
                <div class="text-xl font-bold text-[var(--accent-blue)] tracking-[0.1em] uppercase">
                    Select Character
                </div>
            </div>

            <div class="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
                <div
                    v-if="auth.characters.length === 0"
                    class="text-[0.85rem] text-[var(--text-secondary)] italic text-center py-6"
                >
                    No characters yet — create one below
                </div>
                <button
                    v-for="char in auth.characters"
                    :key="char.name"
                    class="flex items-center justify-between px-4 py-3 border border-[var(--border-panel)] bg-[#061414] hover:border-[var(--accent-blue)] hover:bg-[rgba(0,192,176,0.07)] transition-colors text-left group"
                    @click="auth.selectCharacter(char.name)"
                >
                    <div>
                        <div
                            class="text-[0.92rem] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors"
                        >
                            {{ char.name }}
                        </div>
                        <div class="text-[0.75rem] text-[var(--text-secondary)] mt-0.5 capitalize">
                            {{ [char.race, char.class].filter(Boolean).join(' ') }} &middot; Level
                            {{ char.level }}
                        </div>
                    </div>
                    <span
                        class="text-[var(--accent-blue)] opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                    >
                        ▶
                    </span>
                </button>
            </div>

            <div class="flex flex-col gap-2 pt-2 border-t border-[var(--border-panel)]">
                <Button
                    variant="primary"
                    class="w-full py-[9px] text-[0.88rem] font-bold tracking-[0.08em] uppercase"
                    @click="showCreate = true"
                >
                    Create New Character
                </Button>
                <Button
                    variant="ghost"
                    class="w-full py-[7px] text-[0.78rem] uppercase tracking-[0.06em] text-[var(--text-secondary)]"
                    @click="auth.reset()"
                >
                    Logout
                </Button>
            </div>
        </div>

        <CharacterCreateModal v-if="showCreate" @close="showCreate = false" />
    </div>
</template>
