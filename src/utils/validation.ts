import type { Participant, ParticipantFormData } from '@/types/participant'

export type FormErrors = Partial<Record<keyof ParticipantFormData, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+380\d{9}$/

export function getToday(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function normalizeForm(form: ParticipantFormData): ParticipantFormData {
  return {
    name: form.name.trim(),
    birthDate: form.birthDate.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)

  if (year === undefined || month === undefined || day === undefined || year < 1) {
    return false
  }

  const date = new Date(0)
  date.setHours(0, 0, 0, 0)
  date.setFullYear(year, month - 1, day)

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function validateParticipant(
  form: ParticipantFormData,
  participants: readonly Participant[],
  currentId?: string,
): FormErrors {
  const data = normalizeForm(form)
  const errors: FormErrors = {}

  if (!data.name) {
    errors.name = 'Введіть ім’я.'
  }

  if (!data.birthDate) {
    errors.birthDate = 'Вкажіть дату народження.'
  } else if (!isValidDate(data.birthDate)) {
    errors.birthDate = 'Вкажіть коректну дату.'
  } else if (data.birthDate > getToday()) {
    errors.birthDate = 'Дата народження не може бути в майбутньому.'
  }

  if (!data.email) {
    errors.email = 'Введіть електронну пошту.'
  } else if (!emailPattern.test(data.email)) {
    errors.email = 'Вкажіть коректну електронну пошту.'
  } else {
    const emailExists = participants.some(
      (participant) =>
        participant.id !== currentId &&
        participant.email.trim().toLowerCase() === data.email.toLowerCase(),
    )

    if (emailExists) {
      errors.email = 'Учасник із такою електронною поштою вже існує.'
    }
  }

  if (!data.phone) {
    errors.phone = 'Введіть номер телефону.'
  } else if (!phonePattern.test(data.phone)) {
    errors.phone = 'Використовуйте формат +380XXXXXXXXX.'
  }

  return errors
}
