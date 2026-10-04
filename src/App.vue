<script setup lang="ts">
import ParticipantsTable from './components/ParticipantsTable.vue'
import RegistrationBlock from './components/RegistrationBlock.vue'
import WinnersBlock from './components/WinnersBlock.vue'
import type { Participant } from './types/participant'

const participants: Participant[] = []
</script>

<template>
  <main class="lottery-app">
    <WinnersBlock />
    <RegistrationBlock />
    <ParticipantsTable :participants="participants" />
  </main>
</template>
