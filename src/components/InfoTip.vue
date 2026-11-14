<script setup lang="ts">
defineProps<{text:string; label?:string}>()
</script>

<template><button class="info-tip" type="button" :aria-label="label ?? 'More information'" :data-tip="text">i</button></template>
