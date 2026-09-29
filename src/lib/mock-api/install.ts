/**
 * Browser-only backend.
 *
 * Every page talks to `/api/...` with fetch(). This module patches window.fetch
 * once, on the client, and answers those calls from a localStorage-backed store,
 * so the whole app runs without a server or database and can be deployed as a
 * static site.
 */
import { handleMockRequest } from "./handlers";

declare global {
  interface Window {
    __sfsMockApiInstalled?: boolean;
  }
}

function parseBody(raw: unknown): unknown {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

if (typeof window !== "undefined" && !window.__sfsMockApiInstalled) {
  window.__sfsMockApiInstalled = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let href: string;
    let method = init?.method;
    let rawBody: unknown = init?.body;

    if (input instanceof Request) {
      href = input.url;
      method = method || input.method;
      if (rawBody === undefined && input.method !== "GET" && input.method !== "HEAD") {
        rawBody = await input.clone().text();
      }
    } else {
      href = input instanceof URL ? input.href : String(input);
    }

    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin && url.pathname.includes("/api/")) {
      const result = await handleMockRequest(method || "GET", url, parseBody(rawBody));
      if (result) {
        return new Response(JSON.stringify(result.body), {
          status: result.status ?? 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return nativeFetch(input, init);
  };
}

export {};
