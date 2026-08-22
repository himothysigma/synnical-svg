function renderHeadContent() {
  return `    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#000000" />
    <title>Synnical OS</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="stylesheet" href="./assets/bundle.css" />
    <style><![CDATA[
      html, body, #root {
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
      foreignObject {
        overflow: visible;
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
    ]]></style>
    <script>/*<![CDATA[*/(function(){
      var XHTML_NS = "http://www.w3.org/1999/xhtml";
      var host = document.querySelector("foreignObject");
      var root = host ? host.firstElementChild : document.documentElement;
      if (!root) return;
      var origCE = document.createElement.bind(document);
      var origCENS = document.createElementNS.bind(document);
      Object.defineProperty(document, "head", { get: function(){ return root.querySelector("head"); }, configurable: true });
      Object.defineProperty(document, "body", { get: function(){ return root.querySelector("body"); }, configurable: true });
      Object.defineProperty(document, "documentElement", { get: function(){ return root; }, configurable: true });
      document.createElement = function(tagName, options) {
        return typeof tagName === "string" ? origCENS(XHTML_NS, tagName, options) : origCE(tagName, options);
      };
      document.createElementNS = function(namespace, qualifiedName, options) {
        return namespace == null || namespace === XHTML_NS
          ? origCENS(XHTML_NS, qualifiedName, options)
          : origCENS(namespace, qualifiedName, options);
      };
      Object.defineProperty(document, "getElementById", {
        value: function(id) {
          return root.querySelector('[id="' + String(id).replace(/["\\\\]/g, "\\\\$&") + '"]');
        },
        configurable: true,
        writable: true
      });
      document.getElementsByTagName = function(tagName) { return root.getElementsByTagNameNS(XHTML_NS, tagName); };
      document.getElementsByTagNameNS = function(namespace, tagName) { return root.getElementsByTagNameNS(namespace, tagName); };
      document.getElementsByClassName = function(className) { return root.getElementsByClassName(className); };
      var origQS = document.querySelector.bind(document);
      var origQSA = document.querySelectorAll.bind(document);
      document.querySelector = function(selector) {
        try { return root.querySelector(selector) || origQS(selector); }
        catch (error) { return origQS(selector); }
      };
      document.querySelectorAll = function(selector) {
        try {
          var matches = root.querySelectorAll(selector);
          return matches.length ? matches : origQSA(selector);
        } catch (error) {
          return origQSA(selector);
        }
      };
    })();/*]]>*/</script>
    <script src="./assets/runtime.js"></script>`
}

function renderBodyContent() {
  return `    <div id="root"></div>
    <script>/*<![CDATA[*/
      window.addEventListener("error", function(event) {
        console.error("[synnical-svg] boot error:", event.error || event.message);
      });
      window.addEventListener("unhandledrejection", function(event) {
        console.error("[synnical-svg] boot rejection:", event.reason);
      });
    /*]]>*/</script>
    <script src="./assets/bundle.js"></script>`
}

export function renderSvgShell() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <title>Synnical OS</title>
  <style><![CDATA[
    .synnical-svg-favicon-mark { display: none; }
    @media (max-width: 128px), (max-height: 128px) {
      foreignObject { display: none; }
      .synnical-svg-favicon-mark { display: block; }
    }
  ]]></style>
  <g class="synnical-svg-favicon-mark">
    <rect x="0" y="0" width="100%" height="100%" rx="22%" fill="#0a0a0a"/>
    <rect x="6%" y="6%" width="88%" height="88%" rx="19%" fill="none" stroke="#ec4899" stroke-width="4" opacity="0.45"/>
    <svg x="17%" y="17%" width="66%" height="66%" viewBox="0 0 30 30">
      <path fill="#2D2D2D" stroke="#FFFFFF" stroke-width="0.6317" d="M24.51,28.51H5.49c-2.21,0-4-1.79-4-4V5.49c0-2.21,1.79-4,4-4h19.03c2.21,0,4,1.79,4,4v19.03 C28.51,26.72,26.72,28.51,24.51,28.51z"/>
      <path fill="#FFFFFF" d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z"/>
      <polygon fill="#FFFFFF" points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1"/>
      <path fill="#FFFFFF" d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z"/>
    </svg>
  </g>
  <foreignObject x="0" y="0" width="100%" height="100%">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
${renderHeadContent()}
      </head>
      <body>
${renderBodyContent()}
      </body>
    </html>
  </foreignObject>
</svg>
`
}
