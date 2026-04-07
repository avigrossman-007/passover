import * as XLSX from 'xlsx'
import type { Room } from '../types'

function formatDate(ts?: number): string {
  if (!ts) return ''
  return new Date(ts).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function sectionLabel(section?: string): string {
  return section === 'home' ? 'משימות בית' : 'ניקיון פסח'
}

export function exportToExcel(rooms: Room[]) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Summary ────────────────────────────────────────────────────────
  const totalRooms = rooms.length
  const totalTasks = rooms.reduce((s, r) => s + r.tasks.length, 0)
  const completedTasks = rooms.reduce((s, r) => s + r.tasks.filter(t => t.completed).length, 0)
  const totalNotes = rooms.reduce((s, r) => {
    const roomNotes = (r.notes ?? []).length
    const taskNotes = r.tasks.reduce((ts, t) => ts + (t.notes ?? []).length, 0)
    return s + roomNotes + taskNotes
  }, 0)
  const totalImages = rooms.reduce((s, r) => {
    const roomImgs = (r.images ?? []).length
    const taskImgs = r.tasks.reduce((ts, t) => ts + (t.images ?? []).length, 0)
    return s + roomImgs + taskImgs
  }, 0)
  const passoverRooms = rooms.filter(r => !r.section || r.section === 'passover').length
  const homeRooms = rooms.filter(r => r.section === 'home').length

  const summaryData = [
    ['סיכום ייצוא', '', new Date().toLocaleDateString('he-IL')],
    [],
    ['סטטיסטיקה', 'ערך'],
    ['סה״כ חדרים / קטגוריות', totalRooms],
    ['חדרי ניקיון פסח', passoverRooms],
    ['משימות בית', homeRooms],
    ['סה״כ משימות', totalTasks],
    ['משימות שהושלמו', completedTasks],
    ['משימות שנותרו', totalTasks - completedTasks],
    ['אחוז השלמה', totalTasks > 0 ? `${Math.round(completedTasks / totalTasks * 100)}%` : '0%'],
    ['סה״כ הערות', totalNotes],
    ['סה״כ תמונות', totalImages],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'סיכום')

  // ── Sheet 2: Sections / Rooms ────────────────────────────────────────────────
  const roomHeaders = ['קטגוריה', 'שם חדר', 'אמוג׳י', 'משימות', 'הושלמו', 'אחוז', 'הערות', 'תמונות']
  const roomRows = rooms.map(r => {
    const total = r.tasks.length
    const done = r.tasks.filter(t => t.completed).length
    const roomNotes = (r.notes ?? []).length
    const taskNotes = r.tasks.reduce((s, t) => s + (t.notes ?? []).length, 0)
    const roomImgs = (r.images ?? []).length
    const taskImgs = r.tasks.reduce((s, t) => s + (t.images ?? []).length, 0)
    return [
      sectionLabel(r.section),
      r.name,
      r.emoji,
      total,
      done,
      total > 0 ? `${Math.round(done / total * 100)}%` : '0%',
      roomNotes + taskNotes,
      roomImgs + taskImgs,
    ]
  })
  const wsRooms = XLSX.utils.aoa_to_sheet([roomHeaders, ...roomRows])
  wsRooms['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsRooms, 'חדרים')

  // ── Sheet 3: Tasks ───────────────────────────────────────────────────────────
  const taskHeaders = ['קטגוריה', 'חדר', 'משימה', 'סטטוס', 'זמן השלמה (שניות)', 'הערות', 'תמונות']
  const taskRows: (string | number)[][] = []
  for (const r of rooms) {
    for (const t of r.tasks) {
      taskRows.push([
        sectionLabel(r.section),
        r.name,
        t.text,
        t.completed ? 'הושלם ✓' : 'ממתין',
        t.completedIn ?? '',
        (t.notes ?? []).length,
        (t.images ?? []).length,
      ])
    }
  }
  const wsTasks = XLSX.utils.aoa_to_sheet([taskHeaders, ...taskRows])
  wsTasks['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 26 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, wsTasks, 'משימות')

  // ── Sheet 4: Notes ───────────────────────────────────────────────────────────
  const noteHeaders = ['קטגוריה', 'חדר', 'שייך ל', 'תוכן הערה', 'נוצר', 'עודכן']
  const noteRows: (string | number)[][] = []
  for (const r of rooms) {
    // Room-level notes
    for (const n of r.notes ?? []) {
      noteRows.push([sectionLabel(r.section), r.name, `חדר: ${r.name}`, n.text, formatDate(n.createdAt), formatDate(n.editedAt)])
    }
    // Task-level notes
    for (const t of r.tasks) {
      for (const n of t.notes ?? []) {
        noteRows.push([sectionLabel(r.section), r.name, `משימה: ${t.text}`, n.text, formatDate(n.createdAt), formatDate(n.editedAt)])
      }
    }
  }
  const wsNotes = XLSX.utils.aoa_to_sheet([noteHeaders, ...noteRows])
  wsNotes['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 40 }, { wch: 18 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsNotes, 'הערות')

  // ── Sheet 5: Images ──────────────────────────────────────────────────────────
  const imgHeaders = ['קטגוריה', 'חדר', 'שייך ל', 'שם קובץ', 'תאריך יצירה', 'מזהה']
  const imgRows: (string | number)[][] = []
  for (const r of rooms) {
    // Room-level images
    for (const img of r.images ?? []) {
      imgRows.push([sectionLabel(r.section), r.name, `חדר: ${r.name}`, img.name, formatDate(img.createdAt), img.id])
    }
    // Task-level images
    for (const t of r.tasks) {
      for (const img of t.images ?? []) {
        imgRows.push([sectionLabel(r.section), r.name, `משימה: ${t.text}`, img.name, formatDate(img.createdAt), img.id])
      }
    }
  }
  const wsImages = XLSX.utils.aoa_to_sheet([imgHeaders, ...imgRows])
  wsImages['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 28 }, { wch: 18 }, { wch: 38 }]
  XLSX.utils.book_append_sheet(wb, wsImages, 'תמונות')

  // ── Download ─────────────────────────────────────────────────────────────────
  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `pesach_cleaning_export_${date}.xlsx`)
}
