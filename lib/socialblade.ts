// SocialBlade API client for Instagram statistics
// Docs: https://matrix.sbapis.com/b/instagram/statistics

export interface SocialBladeDailyEntry {
  date: string
  followers: number
  following: number
  uploads: number
}

export interface SocialBladeStats {
  username: string
  followers: number
  following: number
  posts: number
  growth_rate_weekly: number  // % change in followers over last 7 days
  daily_history: SocialBladeDailyEntry[]
}

export async function fetchInstagramStats(username: string): Promise<SocialBladeStats | null> {
  const clientId = process.env.SOCIALBLADE_CLIENT_ID
  const token = process.env.SOCIALBLADE_TOKEN

  if (!clientId || !token) {
    console.error('[SocialBlade] Missing credentials (SOCIALBLADE_CLIENT_ID / SOCIALBLADE_TOKEN)')
    return null
  }

  const url = `https://matrix.sbapis.com/b/instagram/statistics?query=${encodeURIComponent(username)}&history=default`

  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        clientid: clientId,
        token: token,
      },
      // Don't cache — we want fresh data each time
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[SocialBlade] Network error:', err)
    return null
  }

  if (!res.ok) {
    let body: Record<string, unknown> = {}
    try { body = await res.json() } catch { /* ignore */ }
    const sbError = (body?.status as Record<string, unknown>)?.error ?? body?.error ?? ''
    console.error(`[SocialBlade] HTTP ${res.status} for @${username}:`, sbError)
    if (res.status === 402) {
      throw new Error(`SocialBlade: créditos insuficientes (402 insufficient_credits). Ative um plano em socialblade.com.`)
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`SocialBlade: credenciais inválidas (${res.status}). Verifique SOCIALBLADE_CLIENT_ID e SOCIALBLADE_TOKEN.`)
    }
    throw new Error(`SocialBlade retornou HTTP ${res.status}: ${sbError}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any
  try {
    json = await res.json()
  } catch (err) {
    console.error('[SocialBlade] Failed to parse JSON:', err)
    return null
  }

  // Defensive parsing — SocialBlade response shape varies
  const data = json?.data ?? json
  const statistics = data?.statistics ?? {}
  const total = statistics?.total ?? {}

  const followers: number = Number(total?.followers ?? 0)
  const following: number = Number(total?.following ?? 0)
  const posts: number = Number(total?.uploads ?? total?.posts ?? 0)

  // Daily history — try common response paths
  const rawHistory: unknown[] = data?.daily ?? data?.history ?? statistics?.daily ?? []

  const daily_history: SocialBladeDailyEntry[] = rawHistory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((entry: any) => ({
      date: String(entry?.date ?? ''),
      followers: Number(entry?.followers ?? 0),
      following: Number(entry?.following ?? 0),
      uploads: Number(entry?.uploads ?? entry?.posts ?? 0),
    }))
    .filter((e) => e.date)
    .sort((a, b) => a.date.localeCompare(b.date))

  // Calculate weekly growth rate (compare last entry to entry 7 days earlier)
  let growth_rate_weekly = 0
  if (daily_history.length >= 2) {
    const latest = daily_history[daily_history.length - 1]
    const sevenDaysAgo = daily_history[Math.max(0, daily_history.length - 8)]
    if (sevenDaysAgo.followers > 0) {
      growth_rate_weekly = ((latest.followers - sevenDaysAgo.followers) / sevenDaysAgo.followers) * 100
    }
  }

  return {
    username,
    followers: followers || (daily_history.length > 0 ? daily_history[daily_history.length - 1].followers : 0),
    following,
    posts,
    growth_rate_weekly: Math.round(growth_rate_weekly * 100) / 100,
    daily_history,
  }
}
