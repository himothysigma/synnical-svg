import {
  io as connect,
  Manager,
  Socket,
  type ManagerOptions,
  type SocketOptions,
} from "synnical-real-socket-client"

type Options = Partial<ManagerOptions & SocketOptions> & { auth?: Record<string, unknown> }

export function io(uri?: string | Options, options?: Options) {
  const suppliedOptions = typeof uri === "string" ? options : uri
  const runtime = globalThis.__synnicalSvgRuntime
  const token = runtime?.sessionToken()
  return connect(runtime?.apiOrigin || "https://synnical.co.uk", {
    ...(suppliedOptions || {}),
    auth: {
      ...(suppliedOptions?.auth || {}),
      ...(token ? { token } : {}),
    },
    withCredentials: false,
  })
}

export { Manager, Socket }
export default io
