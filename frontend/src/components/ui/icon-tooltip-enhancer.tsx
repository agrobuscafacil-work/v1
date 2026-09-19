'use client';

import { useEffect } from 'react';

function enhanceIconControls(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('button, a').forEach((element) => {
    if (!element.querySelector('svg')) return;
    const visibleText = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent?.trim() || '')
      .join(' ')
      .trim();
    if (visibleText) return;

    const label = element.getAttribute('aria-label') || element.getAttribute('title');
    if (!label) return;
    element.dataset.tooltip = label;
  });
}

export default function IconTooltipEnhancer() {
  useEffect(() => {
    enhanceIconControls();
    const observer = new MutationObserver(() => enhanceIconControls());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
