export interface Note {
  id: string
  text: string
  createdAt: number // timestamp ms
  editedAt?: number
}

export interface ImageAttachment {
  id: string
  name: string
  dataUrl: string // base64 data URL
  createdAt: number
}

export interface Task {
  id: string
  text: string
  completed: boolean
  order: number
  completedIn?: number // seconds it took to complete
  notes?: Note[]
  images?: ImageAttachment[]
}

export interface Room {
  id: string
  name: string
  emoji: string
  colorFrom: string
  colorTo: string
  textColor: string
  tasks: Task[]
  order: number
  notes?: Note[]
  images?: ImageAttachment[]
  section?: 'passover' | 'home' // which board this belongs to
}

export interface ActiveTask {
  roomId: string
  taskId: string
  startedAt: number // timestamp
}
