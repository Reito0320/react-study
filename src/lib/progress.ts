export const STORAGE_KEY = 'hook-lab-progress-v1'
export type Progress = Record<string, number>
export function readProgress(): Progress {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(Object.entries(value).filter(([, n]) => Number.isInteger(n) && n >= 0 && n <= 4))
  } catch { return {} }
}
export function advanceStep(current: number, step: number): number {
  if (step < current) return step
  return step === current && current < 4 ? current + 1 : current
}
