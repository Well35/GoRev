<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/button.vue';
import Input from '@/components/ui/input.vue';
import Tabs from '@/components/ui/tabs.vue';
import TabsList from '@/components/ui/tabs-list.vue';
import TabsTrigger from '@/components/ui/tabs-trigger.vue';

const auth = useAuthStore();

const activeTab = ref<'login' | 'register'>('login');

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

async function handleLogin() {
    if (!username.value || !password.value) return;
    loading.value = true;
    await auth.login(username.value, password.value);
    loading.value = false;
}

async function handleRegister() {
    if (!username.value || !password.value) return;
    if (password.value !== confirmPassword.value) {
        auth.error = 'Passwords do not match';
        return;
    }
    loading.value = true;
    await auth.register(username.value, password.value);
    loading.value = false;
}

function switchTab(tab: 'login' | 'register') {
    activeTab.value = tab;
    auth.error = null;
}
</script>

<template>
    <div class="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(2,8,16,0.92)]">
        <div
            class="flex flex-col gap-4 py-8 px-10 bg-[var(--bg-panel)] border border-[var(--border-panel)] w-[320px]"
        >
            <div class="text-center">
                <div class="text-xl font-bold text-[var(--accent-blue)] tracking-[0.1em] uppercase">
                    GoMud
                </div>
                <div
                    class="text-[0.8rem] text-[var(--text-muted)] tracking-[0.06em] uppercase mt-1"
                >
                    Web Client
                </div>
            </div>

            <Tabs v-model="activeTab" class="w-full">
                <TabsList>
                    <TabsTrigger
                        value="login"
                        :model-value="activeTab"
                        @update:model-value="switchTab('login')"
                    >
                        Login
                    </TabsTrigger>
                    <TabsTrigger
                        value="register"
                        :model-value="activeTab"
                        @update:model-value="switchTab('register')"
                    >
                        Register
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <form
                class="flex flex-col gap-3"
                @submit.prevent="activeTab === 'login' ? handleLogin() : handleRegister()"
            >
                <div class="flex flex-col gap-1">
                    <label
                        class="text-[0.75rem] text-[var(--text-secondary)] uppercase tracking-[0.06em]"
                        >Username</label
                    >
                    <Input
                        v-model="username"
                        autocomplete="username"
                        :disabled="loading"
                        placeholder="Enter username"
                    />
                </div>
                <div class="flex flex-col gap-1">
                    <label
                        class="text-[0.75rem] text-[var(--text-secondary)] uppercase tracking-[0.06em]"
                        >Password</label
                    >
                    <Input
                        v-model="password"
                        type="password"
                        autocomplete="current-password"
                        :disabled="loading"
                        placeholder="Enter password"
                    />
                </div>
                <div v-if="activeTab === 'register'" class="flex flex-col gap-1">
                    <label
                        class="text-[0.75rem] text-[var(--text-secondary)] uppercase tracking-[0.06em]"
                        >Confirm Password</label
                    >
                    <Input
                        v-model="confirmPassword"
                        type="password"
                        autocomplete="new-password"
                        :disabled="loading"
                        placeholder="Confirm password"
                    />
                </div>

                <div
                    v-if="auth.error"
                    class="text-[0.78rem] text-[#ef4444] bg-[#1a0000] border border-[#6a1010] px-3 py-2"
                >
                    {{ auth.error }}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    :disabled="loading"
                    class="mt-1 w-full py-[9px] text-[0.88rem] font-bold tracking-[0.08em] uppercase"
                >
                    {{ loading ? '...' : activeTab === 'login' ? 'Login' : 'Register' }}
                </Button>
            </form>
        </div>
    </div>
</template>
