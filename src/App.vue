<script setup lang="ts">
import ParticipantsTable from './components/ParticipantsTable.vue'
import RegistrationBlock from './components/RegistrationBlock.vue'
import WinnersBlock from './components/WinnersBlock.vue'
import { useParticipants } from './composables/useParticipants'

const {
  participants,
  winners,
  canChooseWinner,
  storageError,
  addParticipant,
  chooseWinner,
  removeWinner,
} = useParticipants()
</script>

<template>
  <main class="lottery-app">
    <p v-if="storageError" class="storage-error" role="alert">
      {{ storageError }}
    </p>

    <WinnersBlock
      :winners="winners"
      :can-choose-winner="canChooseWinner"
      @new-winner="chooseWinner"
      @remove-winner="removeWinner"
    />

    <RegistrationBlock :participants="participants" @save="addParticipant" />

    <ParticipantsTable :participants="participants" />
  </main>
</template>
