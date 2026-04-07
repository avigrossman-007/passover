import type { Room } from '../types'

let taskId = 0
const tid = () => `default-task-${++taskId}`
const mkTask = (text: string, order: number) => ({
  id: tid(), text, completed: false, order,
})

export const defaultRooms: Room[] = [
  {
    id: 'kitchen',
    name: 'מטבח',
    emoji: '🍳',
    colorFrom: '#F97316',
    colorTo: '#FB923C',
    textColor: '#FFF7ED',
    order: 0,
    tasks: [
      mkTask('ניקוי ארונות', 0),
      mkTask('ניקוי תנור', 1),
      mkTask('ניקוי מקרר', 2),
      mkTask('שטיפת משטחים', 3),
      mkTask('ניקוי כיור', 4),
    ],
  },
  {
    id: 'living-room',
    name: 'סלון',
    emoji: '🛋️',
    colorFrom: '#EF4444',
    colorTo: '#F87171',
    textColor: '#FEF2F2',
    order: 1,
    tasks: [
      mkTask('שאיבת אבק ספות', 0),
      mkTask('ניקוי מדפים', 1),
      mkTask('שטיפת רצפה', 2),
      mkTask('בדיקת פינות', 3),
    ],
  },
  {
    id: 'bedroom',
    name: 'חדר שינה',
    emoji: '🛏️',
    colorFrom: '#8B5CF6',
    colorTo: '#A78BFA',
    textColor: '#F5F3FF',
    order: 2,
    tasks: [
      mkTask('בדיקת מגירות', 0),
      mkTask('ניקוי ארון', 1),
      mkTask('שאיבת אבק', 2),
      mkTask('ניקוי מתחת למיטה', 3),
    ],
  },
  {
    id: 'bathroom',
    name: 'חדר אמבטיה',
    emoji: '🚿',
    colorFrom: '#06B6D4',
    colorTo: '#22D3EE',
    textColor: '#ECFEFF',
    order: 3,
    tasks: [
      mkTask('ניקוי אריחים', 0),
      mkTask('ניקוי מראה', 1),
      mkTask('ניקוי אסלה', 2),
      mkTask('ניקוי כיור', 3),
    ],
  },
  {
    id: 'dining-room',
    name: 'פינת אוכל',
    emoji: '🍽️',
    colorFrom: '#FBBF24',
    colorTo: '#FDE68A',
    textColor: '#451A03',
    order: 4,
    tasks: [
      mkTask('ניקוי שולחן', 0),
      mkTask('ניקוי כיסאות', 1),
      mkTask('שטיפת רצפה', 2),
    ],
  },
]

export const presetEmojis = ['🍳', '🛋️', '🛏️', '🚿', '🍽️', '🧹', '📦', '🪴', '🚗', '👶', '📚', '🎮']

export const presetColors: { from: string; to: string; text: string }[] = [
  { from: '#F97316', to: '#FB923C', text: '#FFF7ED' },
  { from: '#EF4444', to: '#F87171', text: '#FEF2F2' },
  { from: '#8B5CF6', to: '#A78BFA', text: '#F5F3FF' },
  { from: '#06B6D4', to: '#22D3EE', text: '#ECFEFF' },
  { from: '#FBBF24', to: '#FDE68A', text: '#451A03' },
  { from: '#3B82F6', to: '#60A5FA', text: '#EFF6FF' },
  { from: '#EC4899', to: '#F472B6', text: '#FDF2F8' },
  { from: '#10B981', to: '#34D399', text: '#ECFDF5' },
]
