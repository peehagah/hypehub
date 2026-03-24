// Apify Instagram Profile Scraper client
// Actor: apify/instagram-profile-scraper
// Docs: https://apify.com/apify/instagram-profile-scraper

export interface ApifyInstagramProfile {
  username: string
  fullName: string | null
  biography: string | null
  followers: number
  following: number
  posts: number
  isVerified: boolean
  isPrivate: boolean
  profilePicUrl: string | null
  engagement_rate: number | null  // null if not enough data
  fetched_at: string
}

export async function fetchInstagramProfile(username: string): Promise<ApifyInstagramProfile> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) {
    throw new Error('APIFY_API_TOKEN não configurado.')
  }

  // Step 1: Start the run and wait up to 120s for it to finish
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${token}&waitForFinish=120`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username] }),
      cache: 'no-store',
    }
  )

  if (!runRes.ok) {
    let body: Record<string, unknown> = {}
    try { body = await runRes.json() } catch { /* ignore */ }
    const msg = (body?.error as Record<string, unknown>)?.message ?? body?.message ?? `HTTP ${runRes.status}`
    throw new Error(`Apify run falhou: ${msg}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runData: any = await runRes.json()
  const run = runData?.data ?? runData

  if (run?.status === 'FAILED' || run?.status === 'ABORTED' || run?.status === 'TIMED-OUT') {
    throw new Error(`Apify run terminou com status: ${run.status}`)
  }

  const datasetId: string = run?.defaultDatasetId ?? run?.id
  if (!datasetId) {
    throw new Error('Apify não retornou defaultDatasetId.')
  }

  // Step 2: Fetch dataset items
  const dataRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&clean=true`,
    { cache: 'no-store' }
  )

  if (!dataRes.ok) {
    throw new Error(`Falha ao buscar dataset Apify: HTTP ${dataRes.status}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = await dataRes.json()

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`Perfil @${username} não encontrado ou conta privada.`)
  }

  const profile = items[0]

  const followers: number = Number(profile?.followersCount ?? profile?.followers ?? 0)
  const following: number = Number(profile?.followsCount ?? profile?.following ?? 0)
  const postsCount: number = Number(profile?.postsCount ?? profile?.mediaCount ?? profile?.posts ?? 0)

  // Engagement rate: avg likes+comments per post / followers * 100
  // instagram-profile-scraper includes latestPosts array in some versions
  let engagement_rate: number | null = null
  const latestPosts: unknown[] = profile?.latestPosts ?? profile?.recentPosts ?? []
  if (Array.isArray(latestPosts) && latestPosts.length > 0 && followers > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalInteractions = latestPosts.reduce((sum: number, p: any) => {
      return sum + Number(p?.likesCount ?? p?.likes ?? 0) + Number(p?.commentsCount ?? p?.comments ?? 0)
    }, 0)
    engagement_rate = Math.round((totalInteractions / latestPosts.length / followers) * 10000) / 100
  }

  return {
    username: profile?.username ?? username,
    fullName: profile?.fullName ?? profile?.name ?? null,
    biography: profile?.biography ?? profile?.bio ?? null,
    followers,
    following,
    posts: postsCount,
    isVerified: Boolean(profile?.verified ?? profile?.isVerified ?? false),
    isPrivate: Boolean(profile?.private ?? profile?.isPrivate ?? false),
    profilePicUrl: profile?.profilePicUrl ?? profile?.profilePicUrlHD ?? null,
    engagement_rate,
    fetched_at: new Date().toISOString(),
  }
}
