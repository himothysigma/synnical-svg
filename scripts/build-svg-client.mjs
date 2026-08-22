import { existsSync } from "node:fs"
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { renderAppHtml, renderSvgShell } from "./svg-shell-template.mjs"

const repoDir = path.resolve(import.meta.dirname, "..")
const defaultSource = path.resolve(repoDir, "../scramjet-fix/app/synnical-main-batch1-full-validated-20260821")
const sourceDir = path.resolve(process.env.SYNNICAL_SOURCE_DIR || defaultSource)
const assetsDir = path.join(repoDir, "assets")
const buildAssetsDir = path.join(repoDir, ".svg-build-assets")
const esbuildModule = path.join(sourceDir, "node_modules/esbuild/lib/main.js")
const esbuild = await import(pathToFileURL(esbuildModule).href)

const sourcePath = (...parts) => path.join(sourceDir, ...parts)
const scriptsPath = (...parts) => path.join(repoDir, "scripts", ...parts)

async function sourceFingerprint(directory) {
  const hash = createHash("sha256")
  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(absolute)
      else if (/\.(?:ts|tsx|css)$/.test(entry.name)) {
        hash.update(path.relative(directory, absolute))
        hash.update(await readFile(absolute))
      }
    }
  }
  await visit(directory)
  return hash.digest("hex")
}

function resolveSourceModule(candidate) {
  for (const suffix of ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", "/index.ts", "/index.tsx", "/index.js"]) {
    const resolved = candidate + suffix
    if (existsSync(resolved)) return resolved
  }
  return candidate
}

const aliasPlugin = {
  name: "synnical-svg-aliases",
  setup(build) {
    build.onResolve({ filter: /^@\/lib\/proxy-runtime$/ }, () => ({ path: scriptsPath("svg-proxy-runtime.ts") }))
    build.onResolve({ filter: /^@\// }, (args) => ({ path: resolveSourceModule(sourcePath("src", args.path.slice(2))) }))
    build.onResolve({ filter: /^synnical-source\// }, (args) => ({
      path: resolveSourceModule(sourcePath(args.path.slice("synnical-source/".length))),
    }))
    build.onResolve({ filter: /^socket\.io-client$/ }, () => ({ path: scriptsPath("socket-client.ts") }))
    build.onResolve({ filter: /^synnical-real-socket-client$/ }, () => ({
      path: sourcePath("node_modules/socket.io-client/build/esm/index.js"),
    }))
    build.onLoad({ filter: /src\/hooks\/use-scramjet\.ts$/ }, async (args) => {
      let contents = await readFile(args.path, "utf8")
      contents = contents
        .replace('scope: "/",', 'scope: new URL(".", SERVICE_WORKER_URL).pathname,')
        .replace('if (!prefix.startsWith("/~/sj/"))', 'if (!prefix.includes("/~/sj/"))')
        .replace('config: {\n        scramjetPath:', 'config: {\n        prefix: new URL("./~/sj/", location.href).pathname,\n        scramjetPath:')
      return { contents, loader: "ts", resolveDir: path.dirname(args.path) }
    })
    build.onLoad({ filter: /src\/app\/page\.tsx$/ }, async (args) => {
      let contents = await readFile(args.path, "utf8")
      contents = contents.replace(
        'const navigation = performance.getEntriesByType("navigation")[0]',
        'const navigation = (window.parent !== window ? window.parent.performance : performance).getEntriesByType("navigation")[0]',
      )
      return { contents, loader: "tsx", resolveDir: path.dirname(args.path) }
    })
  },
}

// Hashed split chunks are immutable. Keeping the previous build beside the new
// one makes the CDN repository look like a mixture of releases and can retain
// removed code indefinitely. Each publication must contain one clean client.
await rm(assetsDir, { recursive: true, force: true })
await mkdir(assetsDir, { recursive: true })
await rm(buildAssetsDir, { recursive: true, force: true })
await mkdir(buildAssetsDir, { recursive: true })

const common = {
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["chrome110", "edge110", "firefox115"],
  jsx: "automatic",
  sourcemap: false,
  minify: true,
  legalComments: "none",
  logLevel: "info",
  nodePaths: [sourcePath("node_modules")],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_AD_ALLOWED_HOSTS": '""',
    "process.env.NEXT_PUBLIC_AD_SCRIPT_URL": '""',
    "process.env.NEXT_PUBLIC_GIPHY_API_KEY": '""',
    "process.env.NEXT_PUBLIC_SOCKET_URL": '"/socket.io"',
    "process.env.NEXT_PUBLIC_STRATUS_API_KEY": '""',
    "process.env.NEXT_PUBLIC_WEBRTC_ICE_SERVERS_JSON": '""',
    "process.env.NEXT_PUBLIC_WISP_URL": '""',
  },
}

await esbuild.build({
  ...common,
  entryPoints: [scriptsPath("svg-runtime.ts")],
  outfile: path.join(buildAssetsDir, "runtime.js"),
})

await esbuild.build({
  ...common,
  entryPoints: { bundle: scriptsPath("svg-entry.tsx") },
  outdir: buildAssetsDir,
  splitting: true,
  chunkNames: "chunks/[name]-[hash]",
  assetNames: "media/[name]-[hash]",
  plugins: [aliasPlugin],
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".gif": "file",
    ".svg": "file",
    ".webp": "file",
  },
})

const nextCssDir = sourcePath(".next/static/chunks")
const nextCssFiles = (await readdir(nextCssDir))
  .filter((file) => file.endsWith(".css"))
  .sort()
const compiledCss = await Promise.all(nextCssFiles.map((file) => readFile(path.join(nextCssDir, file), "utf8")))
await writeFile(path.join(buildAssetsDir, "bundle.css"), compiledCss.join("\n"))
await cp(buildAssetsDir, assetsDir, { recursive: true, force: true })

await cp(sourcePath("public"), repoDir, { recursive: true, force: true })

const swSource = await readFile(sourcePath("public/sw.js"), "utf8")
const svgWorker = swSource
  .replace('const SYNNICAL_PROXY_PREFIX = "/~/sj/"', 'const SYNNICAL_PROXY_PREFIX = new URL("./~/sj/", self.location.href).pathname')
  .replace('importScripts(`/controller/controller.sw.js?synnical-runtime=${SYNNICAL_PROXY_RUNTIME}`)', 'importScripts(new URL(`./controller/controller.sw.js?synnical-runtime=${SYNNICAL_PROXY_RUNTIME}`, self.location.href).href)')
await writeFile(path.join(repoDir, "sw.js"), svgWorker)

const controllerPath = path.join(repoDir, "scramjet/controller.js")
const controllerSource = await readFile(controllerPath, "utf8")
const isolatedController = controllerSource
  .replace('indexedDB.open("__scramjet_controller",1)', 'indexedDB.open("__scramjet_controller_"+(globalThis.__synnicalSvgStorageId||"default"),1)')
  .replace('new BroadcastChannel("__scramjet_controller_channel")', 'new BroadcastChannel("__scramjet_controller_channel_"+(globalThis.__synnicalSvgStorageId||"default"))')
await writeFile(controllerPath, isolatedController)

const assetFiles = await readdir(buildAssetsDir)
const cssFile = assetFiles.find((file) => file === "bundle.css")
if (!cssFile) throw new Error("The SVG client build did not produce bundle.css")

await writeFile(path.join(repoDir, "app.html"), renderAppHtml())
await writeFile(path.join(repoDir, "index.svg"), renderSvgShell())
for (let index = 1; index <= 100; index += 1) {
  const filename = `synnical-${String(index).padStart(3, "0")}.svg`
  await writeFile(path.join(repoDir, filename), renderSvgShell())
}

await cp(sourcePath("public/logo.svg"), path.join(repoDir, "favicon.svg"), { force: true })
await writeFile(path.join(repoDir, ".nojekyll"), "")
await writeFile(path.join(repoDir, "_redirects"), "/* /index.svg 200\n")

await writeFile(path.join(repoDir, "BUILD-SOURCE.json"), JSON.stringify({
  client: "current Synnical production source",
  entry: "src/app/page.tsx",
  sourceFingerprint: await sourceFingerprint(sourcePath("src")),
  storageIsolation: "per SVG filename",
  apiCredentials: "bearer token; cookies omitted",
}, null, 2) + "\n")

await rm(buildAssetsDir, { recursive: true, force: true })

console.log(`Built Synnical SVG from ${sourceDir}`)
console.log(`Generated ${assetFiles.length} top-level assets and 101 isolated SVG entry links`)
