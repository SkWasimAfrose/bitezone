export function isAvailableNow(startTime, endTime) {
  if (!startTime || !endTime) return true;

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHours * 60 + currentMinutes;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startTimeInMinutes = startHour * 60 + startMinute;

  const [endHour, endMinute] = endTime.split(':').map(Number);
  let endTimeInMinutes = endHour * 60 + endMinute;

  // Handle time window crossing midnight
  if (endTimeInMinutes < startTimeInMinutes) {
    if (currentTime >= startTimeInMinutes || currentTime <= endTimeInMinutes) {
      return true;
    }
    return false;
  }

  return currentTime >= startTimeInMinutes && currentTime <= endTimeInMinutes;
}
