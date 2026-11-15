<script setup lang="ts">
import { computed } from 'vue'
import { validationFor } from '../validation/catalog'
const props=defineProps<{calculatorId:string}>()
const emit=defineEmits<{resources:[]}>()
const entry=computed(()=>validationFor(props.calculatorId))
</script>

<template>
  <aside class="validation-notice" :class="`validation-${entry.level}`" aria-label="Calculator validation status">
    <strong>{{ entry.label }}</strong><span>{{ entry.summary }}</span>
    <button type="button" @click="emit('resources')">Validation register</button>
  </aside>
</template>
