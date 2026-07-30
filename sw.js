// ============== 饭团成长日记 · Service Worker（网络优先 + 离线兜底） ==============
// 策略：联网时永远拉取最新文件（保证每天内容/代码更新生效），
//       断网或服务器不可达时回退到上次缓存（app 不白屏，已看内容照常使用）。
const CACHE = "yitiantuan-v38";
const PRECACHE = [
  "./", "index.html", "style.css", "app.js", "manifest.json",
  "assets/icon-192.png", "assets/icon-512.png", "assets/icon-maskable-512.png"
];

self.addEventListener("install", e => {
  self.skipWaiting(); // 立刻激活新 SW，不等旧页面关闭
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // 预缓存关键文件；单个失败不影响整体安装
    await Promise.allSettled(PRECACHE.map(u => c.add(u).catch(() => {})));
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    // 删除旧版本缓存（含 yitiantuan-v1 / v2-nocache）
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim(); // 接管所有已打开页面
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return; // 非 GET 不处理
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 只处理同源（Supabase 等走网络）

  e.respondWith((async () => {
    // 1) 网络优先：拿到最新就更新缓存并返回
    try {
      const fresh = await fetch(req);
      if (fresh && (fresh.ok || fresh.type === "opaque")) {
        const c = await caches.open(CACHE);
        c.put(req, fresh.clone());
      }
      return fresh;
    } catch (_) {
      // 2) 离线兜底：用缓存响应
      const cached = await caches.match(req);
      if (cached) return cached;
      // 3) 导航请求兜底：返回缓存的首页，保证 app 能打开
      if (req.mode === "navigate") {
        const idx = await caches.match("./index.html") || await caches.match("index.html");
        if (idx) return idx;
      }
      return new Response("离线且未缓存该资源", { status: 504, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});
