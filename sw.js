/* Synnical Scramjet 2 service-worker entrypoint. */
importScripts("./controller/controller.sw.js")

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

if (!self.$scramjetController) {
  throw new Error("Scramjet controller worker failed to load")
}

self.addEventListener("fetch", (event) => {
  if (self.$scramjetController.shouldRoute(event)) {
    event.respondWith(self.$scramjetController.route(event))
  }
})
