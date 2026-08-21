const runtime = globalThis.__synnicalSvgRuntime

if (!runtime) throw new Error("Synnical SVG runtime was not initialised")

export const PROXY_RUNTIME_VERSION = "sj2-alpha2-controller14-synnical-os-20260821-svg3"
export const proxyAsset = (path: string) => {
  const url = new URL(runtime.assetUrl(path))
  url.searchParams.set("synnical-runtime", PROXY_RUNTIME_VERSION)
  return url.href
}
