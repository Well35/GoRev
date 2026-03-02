<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
    <div class="flex flex-col">
        <slot />
    </div>
</template>
