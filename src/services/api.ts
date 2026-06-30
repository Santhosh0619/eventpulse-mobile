import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '@/lib/env'
import { useAuthStore } from '@/store/authStore'

/** A normalized error surfaced to the UI from any failed request. */
export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string>
}

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  // Fail rather than hang forever on a flaky network (e.g. a stuck QR check-in
  // at an event venue). Rejected requests surface as normalized errors.
  timeout: 15000,
})

// --- Request: attach the access token --------------------------------------
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Response: auto-refresh once on 401, then normalize errors --------------
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

// Share a single in-flight refresh so concurrent 401s don't each refresh.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setSession, clear } = useAuthStore.getState()
  if (!refreshToken) {
    clear()
    throw new Error('No refresh token')
  }
  try {
    const resp = await axios.post(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
      refresh_token: refreshToken,
    })
    const access = resp.data.access_token as string
    const refresh = resp.data.refresh_token as string
    setSession({ access, refresh })
    return access
  } catch (err) {
    clear()
    throw err
  }
}

function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const data = error.response?.data as
    | {
        message?: string
        detail?: string
        errors?: { field?: string; message: string }[]
      }
    | undefined
  const fieldErrors: Record<string, string> = {}
  for (const e of data?.errors ?? []) {
    if (e.field) fieldErrors[e.field] = e.message
  }
  return {
    status,
    message:
      data?.message ?? data?.detail ?? error.message ?? 'Something went wrong',
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const isAuthEndpoint = original?.url?.includes('/auth/')

    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !isAuthEndpoint
    ) {
      original._retried = true
      try {
        refreshPromise ??= refreshAccessToken()
        const newToken = await refreshPromise
        refreshPromise = null
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        refreshPromise = null
        // Refresh failed: session is dead. RootNavigator redirects on cleared auth.
        return Promise.reject(normalizeError(error))
      }
    }
    return Promise.reject(normalizeError(error))
  },
)
