function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export function renderSvgShell({ linkId }) {
  const appUrl = `./app.html?synnicalLink=${encodeURIComponent(linkId)}`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#000000" />
  <foreignObject x="0" y="0" width="100%" height="100%">
    <iframe
      xmlns="http://www.w3.org/1999/xhtml"
      src="${escapeAttribute(appUrl)}"
      title="Synnical OS"
      allow="autoplay; clipboard-read; clipboard-write; display-capture; fullscreen; microphone; camera"
      allowfullscreen="allowfullscreen"
      style="display:block;border:0;margin:0;padding:0;width:100%;height:100%;background:#000"
    ></iframe>
  </foreignObject>
</svg>
`
}

export function renderAppHtml({ cssFile = "bundle.css" } = {}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Google Classroom</title>
    <link rel="icon" type="image/png" href="./brand/google-classroom.png" />
    <link rel="stylesheet" href="./assets/${escapeAttribute(cssFile)}" />
    <style>html,body,#root{box-sizing:border-box;margin:0;padding:0;width:100%;height:100%;min-width:100%;min-height:100%;overflow:hidden;background:#000}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      const root = document.getElementById("root");
      const showFailure = (error) => {
        console.error("[synnical-svg] application boot failed", error);
        if (!root) return;
        root.textContent = "";
        const panel = document.createElement("pre");
        panel.style.cssText = "box-sizing:border-box;margin:0;padding:24px;white-space:pre-wrap;font:14px monospace;color:#ff8b8b;background:#050505;width:100%;height:100%";
        panel.textContent = "Synnical failed to start.\\n" + String(error && (error.stack || error.message || error));
        root.appendChild(panel);
      };
      window.addEventListener("error", (event) => showFailure(event.error || event.message));
      window.addEventListener("unhandledrejection", (event) => showFailure(event.reason));
      try {
        await import(new URL("./assets/runtime.js", window.location.href).href);
        await import(new URL("./assets/bundle.js", window.location.href).href);
      } catch (error) {
        showFailure(error);
      }
    </script>
  </body>
</html>
`
}
