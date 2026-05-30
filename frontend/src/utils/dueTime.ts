export function formatDueIn(value?: string | null, now = new Date()) {
  if (!value) {
    return 'sem previsao'
  }

  const due = new Date(value)
  if (Number.isNaN(due.getTime())) {
    return 'sem previsao'
  }

  const diffMinutes = Math.max(0, Math.round((due.getTime() - now.getTime()) / 60_000))
  if (diffMinutes <= 0) {
    return 'agora'
  }

  const months = Math.floor(diffMinutes / 43_200)
  const days = Math.floor((diffMinutes % 43_200) / 1_440)
  const hours = Math.floor((diffMinutes % 1_440) / 60)
  const minutes = diffMinutes % 60
  const parts: string[] = []

  if (months) {
    parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`)
  }
  if (days) {
    parts.push(`${days}d`)
  }
  if (!months && hours) {
    parts.push(`${hours}h`)
  }
  if (!months && !days && minutes) {
    parts.push(`${minutes}min`)
  }

  return `em ${parts.slice(0, 2).join(' ')}`
}

export function nextDueLabel(dueCount?: number | null, nextDueAt?: string | null) {
  if (dueCount != null && dueCount > 0) {
    return `${dueCount} vencidos agora`
  }
  return `proximo ${formatDueIn(nextDueAt)}`
}
