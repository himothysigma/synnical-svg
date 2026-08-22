const CANONICAL_URL = "https://synnical.co.uk/"

function renderRedirectPage() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0;url=${CANONICAL_URL}" />
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <title>Synnical OS</title>
    <style>
      :root { color-scheme: dark; }
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #000;
        color: #fff;
      }
      body {
        display: grid;
        place-items: center;
        font: 500 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        display: grid;
        place-items: center;
        gap: 18px;
        text-align: center;
      }
      .mark {
        position: relative;
        display: grid;
        width: 72px;
        height: 72px;
        place-items: center;
        border: 1px solid #ffffff24;
        border-radius: 22px;
        background: radial-gradient(circle at 35% 25%, #ff315866, transparent 54%), #080808;
        box-shadow: 0 22px 70px #ff214533;
      }
      .mark::before {
        content: "S";
        font-size: 34px;
        font-weight: 850;
        letter-spacing: -.08em;
      }
      .ring {
        position: absolute;
        inset: -8px;
        border: 1px solid #ff315844;
        border-radius: 28px;
        animation: pulse 900ms ease-in-out infinite alternate;
      }
      h1 {
        margin: 0;
        font-size: 18px;
        letter-spacing: .34em;
        text-indent: .34em;
      }
      p {
        margin: 0;
        color: #ffffff80;
      }
      a {
        color: #fff;
      }
      @keyframes pulse { to { transform: scale(1.08); opacity: .22; } }
      @media (prefers-reduced-motion: reduce) {
        .ring { animation: none; }
      }
    </style>
    <script><![CDATA[
      (function () {
        var canonical = "https://synnical.co.uk/";
        try { window.location.replace(canonical); }
        catch (error) { window.location.href = canonical; }
      })();
    ]]></script>
  </head>
  <body>
    <main>
      <div class="mark" aria-hidden="true"><span class="ring"></span></div>
      <h1>SYNNICAL</h1>
      <p>Opening Synnical OS… <a href="${CANONICAL_URL}">Continue</a></p>
    </main>
  </body>
</html>
`
}

export function renderAppHtml() {
  return renderRedirectPage()
}

export function renderSvgShell() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#000000" />
  <text x="50%" y="50%" fill="#ffffff" font-family="ui-sans-serif,system-ui,sans-serif" font-size="22" text-anchor="middle">Opening Synnical OS…</text>
  <script><![CDATA[
    (function () {
      var canonical = "https://synnical.co.uk/";
      try { window.location.replace(canonical); }
      catch (error) { window.location.href = canonical; }
    })();
  ]]></script>
</svg>
`
}
