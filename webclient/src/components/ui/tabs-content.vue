<script setup lang="ts">
defineProps<{ value: string; modelValue: string }>();
</script>

<template>
    <div v-if="modelValue === value">
        <slot />
    </div>
</template>
