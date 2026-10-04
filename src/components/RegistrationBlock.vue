<script setup lang="ts">
import ParticipantForm from './ParticipantForm.vue'
import type { Participant, ParticipantFormData } from '@/types/participant'

defineProps<{
  participants: readonly Participant[]
}>()

defineEmits<{
  save: [data: ParticipantFormData]
}>()
</script>

<template>
  <section class="lottery-panel registration-block" aria-labelledby="registration-title">
    <h1 id="registration-title" class="lottery-title">REGISTER FORM</h1>

    <p class="registration-description">Please fill in all the fields.</p>

    <ParticipantForm :participants="participants" @save="$emit('save', $event)" />
  </section>
</template>
