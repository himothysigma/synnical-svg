const API_ORIGIN = "https://synnical.co.uk"
const SVG_CLIENT_HEADER = "X-Synnical-Client"
const SVG_CLIENT_VALUE = "svg"

type SynnicalSvgRuntime = {
  apiOrigin: string
  assetBase: string
  assetUrl: (path: string) => string
  linkId: string
  resolveUrl: (path: string) => string
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
const sessionStoragePrefix = `synnical.svg.sessionStorage.v1:${linkId}:`
const sessionKey = `synnical.svg.session.v3:${linkId}`
const nativeStorage = window.localStorage
const nativeSessionStorage = window.sessionStorage
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

function makeNamespacedStorage(native: Storage, prefix: string): Storage {
  return {
    get length() {
      let count = 0
      for (let index = 0; index < native.length; index += 1) {
        if (native.key(index)?.startsWith(prefix)) count += 1
      }
      return count
    },
    clear() {
      const keys: string[] = []
      for (let index = 0; index < native.length; index += 1) {
        const key = native.key(index)
        if (key?.startsWith(prefix)) keys.push(key)
      }
      keys.forEach((key) => native.removeItem(key))
    },
    getItem(key: string) {
      return native.getItem(prefix + String(key))
    },
    key(index: number) {
      const keys: string[] = []
      for (let cursor = 0; cursor < native.length; cursor += 1) {
        const key = native.key(cursor)
        if (key?.startsWith(prefix)) keys.push(key.slice(prefix.length))
      }
      return keys[index] ?? null
    },
    removeItem(key: string) {
      native.removeItem(prefix + String(key))
    },
    setItem(key: string, value: string) {
      native.setItem(prefix + String(key), String(value))
    },
  }
}

function installNamespacedStorage(): void {
  const storage = makeNamespacedStorage(nativeStorage, storagePrefix)
  const sessionStorage = makeNamespacedStorage(nativeSessionStorage, sessionStoragePrefix)

  try {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    })
  } catch {
    // The authentication token remains isolated even in engines that do not
    // allow the Storage accessor to be replaced.
  }
  try {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: sessionStorage,
    })
  } catch {}
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

function isLocalAssetPath(pathname: string): boolean {
  return /^\/(?:assets|brand|controller|discord-assets|download|games|scramjet|synnflix)\//.test(pathname)
    || /^\/(?:favicon\.svg|icon\.png|logo\.svg|manifest\.webmanifest|robots\.txt|sw\.js)$/.test(pathname)
}

function rewriteResource(value: string): string {
  if (!value || /^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(value)) return value
  let parsed: URL
  try {
    parsed = new URL(value, window.location.href)
  } catch {
    return value
  }
  if (isLocalApi(parsed)) return new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, API_ORIGIN).href
  if (parsed.origin === window.location.origin && isLocalAssetPath(parsed.pathname)) return assetUrl(`${parsed.pathname}${parsed.search}${parsed.hash}`)
  return value
}

const nativeSetAttribute = Element.prototype.setAttribute
Element.prototype.setAttribute = function setSynnicalSvgAttribute(name: string, value: string): void {
  const normalized = name.toLowerCase()
  const rewritten = normalized === "src" || normalized === "href" || normalized === "poster" || normalized === "action"
    ? rewriteResource(String(value))
    : value
  nativeSetAttribute.call(this, name, rewritten)
}

function patchUrlProperty(proto: object, property: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(proto, property)
  if (!descriptor?.set || !descriptor?.get) return
  try {
    Object.defineProperty(proto, property, {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value: string) {
        descriptor.set?.call(this, rewriteResource(String(value)))
      },
    })
  } catch {}
}

patchUrlProperty(HTMLAnchorElement.prototype, "href")
patchUrlProperty(HTMLAreaElement.prototype, "href")
patchUrlProperty(HTMLBaseElement.prototype, "href")
patchUrlProperty(HTMLFormElement.prototype, "action")
patchUrlProperty(HTMLIFrameElement.prototype, "src")
patchUrlProperty(HTMLImageElement.prototype, "src")
patchUrlProperty(HTMLInputElement.prototype, "src")
patchUrlProperty(HTMLLinkElement.prototype, "href")
patchUrlProperty(HTMLScriptElement.prototype, "src")
patchUrlProperty(HTMLSourceElement.prototype, "src")
patchUrlProperty(HTMLTrackElement.prototype, "src")
patchUrlProperty(HTMLVideoElement.prototype, "poster")

const NativeXMLHttpRequestOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function openSynnicalSvgRequest(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null): void {
  return NativeXMLHttpRequestOpen.call(this, method, rewriteResource(String(url)), async ?? true, username ?? null, password ?? null)
}

const NativeWebSocket = window.WebSocket
class SynnicalSvgWebSocket extends NativeWebSocket {
  constructor(url: string | URL, protocols?: string | string[]) {
    const parsed = new URL(rewriteResource(String(url)), window.location.href)
    if (parsed.origin === window.location.origin && /^\/wisp(?:-nl)?\//.test(parsed.pathname)) {
      parsed.protocol = "wss:"
      parsed.host = new URL(API_ORIGIN).host
    }
    super(parsed.href, protocols)
  }
}
window.WebSocket = SynnicalSvgWebSocket

window.fetch = async function synnicalSvgFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const originalUrl = requestUrl(input)
  const targetUrl = rewriteApiUrl(originalUrl)
  const rewrittenResource = rewriteResource(originalUrl.href)
  const isApi = targetUrl.origin === API_ORIGIN && (targetUrl.pathname === "/api" || targetUrl.pathname.startsWith("/api/"))

  if (!isApi) {
    if (rewrittenResource !== originalUrl.href) {
      return input instanceof Request
        ? nativeFetch(new Request(rewrittenResource, input), init)
        : nativeFetch(rewrittenResource, init)
    }
    return nativeFetch(input, init)
  }

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

globalThis.__synnicalSvgStorageId = linkId
globalThis.__synnicalSvgRuntime = {
  apiOrigin: API_ORIGIN,
  assetBase,
  assetUrl,
  linkId,
  resolveUrl: rewriteResource,
  sessionToken: readSessionToken,
}

installNamespacedStorage()

export {}
