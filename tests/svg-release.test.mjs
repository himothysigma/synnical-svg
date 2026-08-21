import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

const repo = path.resolve(import.meta.dirname, "..")
const read = (file) => readFile(path.join(repo, file), "utf8")

test("every SVG link uses its own fixed storage identity", async () => {
  const index = await read("index.svg")
  assert.match(index, /app\.html\?synnicalLink=index\.svg/)

  for (let number = 1; number <= 100; number += 1) {
    const filename = `synnical-${String(number).padStart(3, "0")}.svg`
    const source = await read(filename)
    assert.match(source, new RegExp(`app\\.html\\?synnicalLink=${filename.replace(".", "\\.")}`))
  }
})

test("authentication is bearer-only and namespaced by SVG filename", async () => {
  const runtimeSource = await read("scripts/svg-runtime.ts")
  const runtimeBuild = await read("assets/runtime.js")
  assert.match(runtimeSource, /searchParams\.get\("synnicalLink"\)/)
  assert.match(runtimeSource, /synnical\.svg\.session\.v3:\$\{linkId\}/)
  assert.match(runtimeSource, /credentials: "omit"/)
  assert.match(runtimeSource, /Authorization.*Bearer/)
  assert.match(runtimeBuild, /credentials:"omit"/)
  assert.doesNotMatch(runtimeBuild, /credentials:"include"/)
})

test("Socket.IO uses the same isolated bearer session without cookies", async () => {
  const socketSource = await read("scripts/socket-client.ts")
  assert.match(socketSource, /sessionToken\(\)/)
  assert.match(socketSource, /withCredentials: false/)
  assert.match(socketSource, /apiOrigin/)
})

test("the HTML parity client boots runtime before the production bundle", async () => {
  const app = await read("app.html")
  const runtimeAt = app.indexOf("./assets/runtime.js")
  const bundleAt = app.indexOf("./assets/bundle.js")
  assert.ok(runtimeAt > 0)
  assert.ok(bundleAt > runtimeAt)
  assert.ok(existsSync(path.join(repo, "assets/bundle.css")))
  assert.ok(existsSync(path.join(repo, "BUILD-SOURCE.json")))
})

test("all generated JavaScript chunk references exist", async () => {
  const files = ["assets/bundle.js"]
  const chunks = await readdir(path.join(repo, "assets/chunks"))
  files.push(...chunks.filter((file) => file.endsWith(".js")).map((file) => `assets/chunks/${file}`))

  for (const file of files) {
    const source = await read(file)
    for (const match of source.matchAll(/(?:\.\/)?chunks\/([a-z0-9_-]+\.js)/gi)) {
      assert.ok(existsSync(path.join(repo, "assets/chunks", match[1])), `${file} references missing ${match[1]}`)
    }
  }
})

test("Scramjet has a CDN-safe scope and isolated cookie jar", async () => {
  const worker = await read("sw.js")
  const controller = await read("scramjet/controller.js")
  const buildScript = await read("scripts/build-svg-client.mjs")
  assert.match(worker, /new URL\("\.\/~\/sj\/", self\.location\.href\)\.pathname/)
  assert.match(worker, /new URL\(`\.\/controller\/controller\.sw\.js/)
  assert.match(controller, /__synnicalSvgStorageId/)
  assert.match(buildScript, /scope: new URL\("\."/)
  assert.match(buildScript, /prefix: new URL\("\.\/~\/sj\/"/)
})
