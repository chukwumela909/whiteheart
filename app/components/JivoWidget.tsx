"use client";

import { useEffect } from "react";

const JIVO_SCRIPT_SRC = "//code.jivosite.com/widget/T17Ve3l6eo";

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
    ensureJivoScript();
  }, []);

  return null;
}
