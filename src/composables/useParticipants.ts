import { computed, ref, watch } from 'vue'
import type { Participant, ParticipantFormData } from '@/types/participant'
import { normalizeForm, validateParticipant } from '@/utils/validation'

const STORAGE_KEY = 'vue-lottery-app:participants'
const MAX_WINNERS = 3

interface RestoreResult {
  participants: Participant[]
  error: string
}

function isParticipant(value: unknown): value is Participant {
  if (typeof value !== 'object' || value === null) {
    return false
  }



  return (
    'id' in value &&
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    'name' in value &&
    typeof value.name === 'string' &&
    'birthDate' in value &&
    typeof value.birthDate === 'string' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'phone' in value &&
    typeof value.phone === 'string'
  )
}

function restoreParticipants(): RestoreResult {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === null) {
      return { participants: [], error: '' }
    }

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return {
        participants: [],
        error: 'Збережені дані мають неправильний формат.',
      }
    }

    const restored: Participant[] = []
    const usedIds = new Set<string>()

    for (const value of parsed) {
      if (!isParticipant(value) || usedIds.has(value.id)) {
        continue
      }

      const data = normalizeForm(value)
      const errors = validateParticipant(data, restored)

      if (Object.keys(errors).length > 0) {
        continue
      }

      restored.push({
        id: value.id,
        ...data,
      })

      usedIds.add(value.id)
    }

    return {
      participants: restored,
      error:
        restored.length === parsed.length
          ? ''
          : 'Деякі збережені записи некоректні й не були відновлені.',
    }
  } catch {
    return {
      participants: [],
      error: 'Не вдалося прочитати збережених учасників.',
    }
  }
}

export function useParticipants() {
  const restored = restoreParticipants()

  const participants = ref<Participant[]>(restored.participants)
  const storageError = ref(restored.error)
  const winnerIds = ref<string[]>([])

  const winners = computed<Participant[]>(() =>
    winnerIds.value.flatMap((id) => {
      const participant = participants.value.find((participant) => participant.id === id)

      return participant ? [participant] : []
    }),
  )

  const availableParticipants = computed<Participant[]>(() =>
    participants.value.filter((participant) => !winnerIds.value.includes(participant.id)),
  )

  const canChooseWinner = computed<boolean>(
    () => winnerIds.value.length < MAX_WINNERS && availableParticipants.value.length > 0,
  )

  watch(
    participants,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        storageError.value = ''
      } catch {
        storageError.value = 'Не вдалося зберегти учасників. Перевірте доступ до сховища браузера.'
      }
    },
    { deep: true },
  )

  function addParticipant(data: ParticipantFormData): void {
    participants.value.push({
      id: crypto.randomUUID(),
      ...data,
    })
  }

  function chooseWinner(): void {
    if (!canChooseWinner.value) {
      return
    }

    const candidates = availableParticipants.value
    const randomIndex = Math.floor(Math.random() * candidates.length)
    const participant = candidates[randomIndex]

    if (participant) {
      winnerIds.value.push(participant.id)
    }
  }

  function removeWinner(id: string): void {
    winnerIds.value = winnerIds.value.filter((winnerId) => winnerId !== id)
  }

  function updateParticipant(id: string, data: ParticipantFormData): void {
    const participant = participants.value.find((participant) => participant.id === id)

    if (participant) {
      Object.assign(participant, data)
    }
  }

  function deleteParticipant(id: string): void {
    participants.value = participants.value.filter((participant) => participant.id !== id)

    removeWinner(id)
  }

  return {
    participants,
    winners,
    canChooseWinner,
    storageError,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    chooseWinner,
    removeWinner,
  }
}
