<script setup lang="ts">
import { ref } from 'vue'
import ParticipantsTable from './components/ParticipantsTable.vue'
import RegistrationBlock from './components/RegistrationBlock.vue'
import WinnersBlock from './components/WinnersBlock.vue'
import type { Participant, ParticipantFormData } from './types/participant'

const participants = ref<Participant[]>([])

function addParticipant(data: ParticipantFormData): void {
  participants.value.push({
    id: crypto.randomUUID(),
    ...data,
  })
}
</script>

<template>
  <main class="lottery-app">
    <WinnersBlock />

    <RegistrationBlock :participants="participants" @save="addParticipant" />

    <ParticipantsTable :participants="participants" />
  </main>
</template>
