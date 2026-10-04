<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger'
    disabled?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
  },
)

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['btn', `btn-${variant}`, 'lottery-button']"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
