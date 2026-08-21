const API_ORIGIN = "https://synnical.co.uk"
const SVG_CLIENT_HEADER = "X-Synnical-Client"
const SVG_CLIENT_VALUE = "svg"

type SynnicalSvgRuntime = {
  apiOrigin: string
  assetBase: string
  assetUrl: (path: string) => string
  linkId: string
  sessionToken: () => string | null
}

declare global {
  var __synnicalSvgRuntime: SynnicalSvgRuntime | undefined
  var __synnicalSvgStorageId: string | undefined
}

const currentUrl = new URL(window.location.href)
const assetBase = new URL("./", currentUrl).href
const requestedLinkId = currentUrl.searchParams.get("synnicalLink")
const linkId = decodeURIComponent(requestedLinkId || currentUrl.pathname.split("/").pop() || "index.svg")
  .replace(/[^a-z0-9._-]/gi, "_")
  .toLowerCase()
const storagePrefix = `synnical.svg.storage.v1:${linkId}:`
const sessionKey = `synnical.svg.session.v3:${linkId}`
const nativeStorage = window.localStorage
const nativeFetch = window.fetch.bind(window)

function readSessionToken(): string | null {
  try {
    const value = nativeStorage.getItem(sessionKey)
    return value && /^[a-f0-9]{64}$/i.test(value) ? value : null
  } catch {
    return null
  }
}

function writeSessionToken(value: unknown): void {
  try {
    if (typeof value === "string" && /^[a-f0-9]{64}$/i.test(value)) {
      nativeStorage.setItem(sessionKey, value)
    }
  } catch {}
}

function clearSessionToken(): void {
  try {
    nativeStorage.removeItem(sessionKey)
  } catch {}
}

function assetUrl(path: string): string {
  const relative = path.startsWith("/") ? `.${path}` : path
  return new URL(relative, assetBase).href
}

function installNamespacedLocalStorage(): void {
  const storage: Storage = {
    get length() {
      let count = 0
      for (let index = 0; index < nativeStorage.length; index += 1) {
        if (nativeStorage.key(index)?.startsWith(storagePrefix)) count += 1
      }
      return count
    },
    clear() {
      const keys: string[] = []
      for (let index = 0; index < nativeStorage.length; index += 1) {
        const key = nativeStorage.key(index)
        if (key?.startsWith(storagePrefix)) keys.push(key)
      }
      keys.forEach((key) => nativeStorage.removeItem(key))
    },
    getItem(key: string) {
      return nativeStorage.getItem(storagePrefix + String(key))
    },
    key(index: number) {
      const keys: string[] = []
      for (let cursor = 0; cursor < nativeStorage.length; cursor += 1) {
        const key = nativeStorage.key(cursor)
        if (key?.startsWith(storagePrefix)) keys.push(key.slice(storagePrefix.length))
      }
      return keys[index] ?? null
    },
    removeItem(key: string) {
      nativeStorage.removeItem(storagePrefix + String(key))
    },
    setItem(key: string, value: string) {
      nativeStorage.setItem(storagePrefix + String(key), String(value))
    },
  }

  try {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    })
  } catch {
    // The authentication token remains isolated even in engines that do not
    // allow the Storage accessor to be replaced.
  }
}

function requestUrl(input: RequestInfo | URL): URL {
  if (input instanceof Request) return new URL(input.url)
  return new URL(String(input), window.location.href)
}

function isLocalApi(url: URL): boolean {
  return url.origin === window.location.origin && (url.pathname === "/api" || url.pathname.startsWith("/api/"))
}

function rewriteApiUrl(url: URL): URL {
  if (!isLocalApi(url)) return url
  return new URL(`${url.pathname}${url.search}${url.hash}`, API_ORIGIN)
}

function isSessionEndpoint(url: URL, name: string): boolean {
  return url.origin === API_ORIGIN && url.pathname === `/api/auth/${name}`
}

window.fetch = async function synnicalSvgFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const originalUrl = requestUrl(input)
  const targetUrl = rewriteApiUrl(originalUrl)
  const isApi = targetUrl.origin === API_ORIGIN && (targetUrl.pathname === "/api" || targetUrl.pathname.startsWith("/api/"))

  if (!isApi) return nativeFetch(input, init)

  const source = input instanceof Request ? input : undefined
  const headers = new Headers(init?.headers || source?.headers)
  headers.set(SVG_CLIENT_HEADER, SVG_CLIENT_VALUE)
  const token = readSessionToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const request = source
    ? new Request(targetUrl, source)
    : new Request(targetUrl, init)
  const response = await nativeFetch(new Request(request, {
    ...init,
    credentials: "omit",
    headers,
  }))

  if (response.ok && (isSessionEndpoint(targetUrl, "login") || isSessionEndpoint(targetUrl, "register"))) {
    void response.clone().json().then((body) => writeSessionToken(body?.token)).catch(() => {})
  }
  if (isSessionEndpoint(targetUrl, "logout")) clearSessionToken()
  return response
}

function rewriteResource(value: string): string {
  if (!value || /^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(value)) return value
  if (value.startsWith("/api/")) return new URL(value, API_ORIGIN).href
  if (/^\/(?:brand|controller|discord-assets|games|scramjet|synnflix)\//.test(value) || value === "/logo.svg" || value === "/sw.js") {
    return assetUrl(value)
  }
  return value
}

const nativeSetAttribute = Element.prototype.setAttribute
Element.prototype.setAttribute = function setSynnicalSvgAttribute(name: string, value: string): void {
  const normalized = name.toLowerCase()
  const rewritten = normalized === "src" || normalized === "href" || normalized === "poster"
    ? rewriteResource(String(value))
    : value
  nativeSetAttribute.call(this, name, rewritten)
}

const NativeWebSocket = window.WebSocket
class SynnicalSvgWebSocket extends NativeWebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    const parsed = new URL(String(url), window.location.href)
    if (parsed.origin === window.location.origin && /^\/wisp(?:-nl)?\//.test(parsed.pathname)) {
      parsed.protocol = "wss:"
      parsed.host = new URL(API_ORIGIN).host
    }
    super(parsed.href, protocols)
  }
}
window.WebSocket = SynnicalSvgWebSocket

globalThis.__synnicalSvgStorageId = linkId
globalThis.__synnicalSvgRuntime = {
  apiOrigin: API_ORIGIN,
  assetBase,
  assetUrl,
  linkId,
  sessionToken: readSessionToken,
}

installNamespacedLocalStorage()

export {}
