"use client";

import { useEffect } from "react";

const LONG_DASHES = /[\u2013\u2014]/g;

function sanitizeTextNodes(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (root.nodeValue && LONG_DASHES.test(root.nodeValue)) {
      root.nodeValue = root.nodeValue.replace(LONG_DASHES, "-");
    }
    LONG_DASHES.lastIndex = 0;
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue && LONG_DASHES.test(node.nodeValue)) {
      node.nodeValue = node.nodeValue.replace(LONG_DASHES, "-");
    }
    LONG_DASHES.lastIndex = 0;
    node = walker.nextNode();
  }
}

/** Impede que conteudo antigo do banco ou de fontes externas exiba tracos longos. */
export function DashSanitizer() {
  useEffect(() => {
    sanitizeTextNodes(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") sanitizeTextNodes(mutation.target);
        mutation.addedNodes.forEach(sanitizeTextNodes);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
