export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getYYYYMMDD = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getMonthStartEnd = (monthString) => {
  const [year, month] = monthString.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)

  return {
    startDate: getYYYYMMDD(startDate),
    endDate: getYYYYMMDD(endDate),
  }
}

export const formatDuration = (decimalHours) => {
  if (decimalHours === undefined || decimalHours === null) return '0h 0m'
  const hours = Math.floor(decimalHours)
  const minutes = Math.round((decimalHours - hours) * 60)
  return `${hours}h ${minutes}m`
}

