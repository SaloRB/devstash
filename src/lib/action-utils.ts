export async function withAction<T>(
  fn: () => Promise<T>,
  errorMsg: string
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn()
    return { success: true as const, data }
  } catch {
    return { success: false as const, error: errorMsg }
  }
}
