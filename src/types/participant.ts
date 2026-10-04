export interface Participant {
  id: string
  name: string
  birthDate: string
  email: string
  phone: string
}

export type ParticipantFormData = Omit<Participant, 'id'>
