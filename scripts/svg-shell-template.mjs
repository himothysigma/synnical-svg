export function renderAppHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <title>Synnical OS</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="stylesheet" href="./assets/bundle.css" />
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #000;
        color: #f4f4f4;
      }
      body {
        font: 500 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      #root {
        width: 100%;
        height: 100%;
      }
      .boot-fallback {
        box-sizing: border-box;
        margin: 0;
        padding: 24px;
        white-space: pre-wrap;
        font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        color: #ff8b8b;
        background: #050505;
        width: 100%;
        height: 100%;
      }
    </style>
    <script src="./assets/runtime.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      const root = document.getElementById("root");

      const showFailure = (error) => {
        console.error("[synnical-svg] application boot failed", error);
        if (!root) return;
        root.innerHTML = "";
        const panel = document.createElement("pre");
        panel.className = "boot-fallback";
        panel.textContent =
          "Synnical failed to start.\\n" +
          String(error && (error.stack || error.message || error));
        root.appendChild(panel);
      };

      window.addEventListener("error", (event) => showFailure(event.error || event.message));
      window.addEventListener("unhandledrejection", (event) => showFailure(event.reason));

      try {
        await import(new URL("./assets/bundle.js", window.location.href).href);
      } catch (error) {
        showFailure(error);
      }
    </script>
  </body>
</html>
`
}

export function renderSvgShell() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#000000" />
  <foreignObject x="0" y="0" width="100%" height="100%">
    <iframe
      xmlns="http://www.w3.org/1999/xhtml"
      src="./app.html?synnicalLink=index.svg"
      title="Synnical OS"
      allow="autoplay; clipboard-read; clipboard-write; display-capture; fullscreen; microphone; camera"
      allowfullscreen="allowfullscreen"
      loading="eager"
      referrerpolicy="no-referrer"
      style="display:block;border:0;margin:0;padding:0;width:100%;height:100%;background:#000"
    ></iframe>
  </foreignObject>
</svg>
`
}
