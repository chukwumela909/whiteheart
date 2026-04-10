"use client";

import { useEffect } from "react";

const JIVO_SCRIPT_SRC = "//code.jivosite.com/widget/T17Ve3l6eo";
const DESKTOP_BREAKPOINT = 1024;

function removeJivoArtifacts() {
  const script = document.querySelector(`script[src*="code.jivosite.com/widget/T17Ve3l6eo"]`);
  if (script?.parentNode) {
    script.parentNode.removeChild(script);
  }

  document
    .querySelectorAll(
      "iframe[src*='jivo'], iframe[src*='jivosite'], div[id*='jivo'], div[class*='jivo'], #jivo-container, #jvlabelWrap"
    )
    .forEach((node) => node.remove());
}

function ensureJivoScript() {
  const existingScript = document.querySelector(`script[src*="code.jivosite.com/widget/T17Ve3l6eo"]`);
  if (existingScript) return;

  const script = document.createElement("script");
  script.src = JIVO_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

export default function JivoWidget() {
  useEffect(() => {
    const syncJivoByViewport = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        removeJivoArtifacts();
        return;
      }
      ensureJivoScript();
    };

    syncJivoByViewport();
    window.addEventListener("resize", syncJivoByViewport);

    return () => {
      window.removeEventListener("resize", syncJivoByViewport);
    };
  }, []);

  return null;
}
