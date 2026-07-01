export function getDeadlineDate(): Date {
  const now = new Date();
  const deadline = new Date(now.getFullYear(), now.getMonth(), 10, 23, 59, 59);
  
  // If we're past the 10th, the deadline is for next month
  if (now.getDate() > 10) {
    deadline.setMonth(deadline.getMonth() + 1);
  }
  
  return deadline;
}

export function getDaysUntilDeadline(): number {
  const now = new Date();
  const deadline = getDeadlineDate();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isDeadlinePassed(): boolean {
  const now = new Date();
  const deadline = getDeadlineDate();
  return now > deadline;
}

export function isUrgent(): boolean {
  return getDaysUntilDeadline() <= 3;
}

export function canSubmitReport(): boolean {
  return !isDeadlinePassed();
}
