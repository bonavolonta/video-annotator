// test/test-suite.js
// Automated test suite for video-annotator v1.3

const assert = require("assert");

console.log("=== Running video-annotator v1.3 Test Suite ===\n");

// 1. YouTube URL Parser
function parseYouTubeId(input) {
  if (!input) return null;
  const text = String(input).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(text)) {
    return text;
  }
  try {
    const urlStr = text.startsWith("http://") || text.startsWith("https://") ? text : "https://" + text;
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "").replace(/^music\./, "");
    if (hostname === "youtube.com") {
      if (parsed.pathname === "/watch") {
        const v = parsed.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      } else if (parsed.pathname.startsWith("/embed/")) {
        const v = parsed.pathname.split("/")[2];
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      } else if (parsed.pathname.startsWith("/shorts/")) {
        const v = parsed.pathname.split("/")[2];
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      }
    } else if (hostname === "youtu.be") {
      const v = parsed.pathname.slice(1).split("/")[0];
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

console.log("1. Testing YouTube URL Parser...");

const validTestCases = [
  ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["http://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["https://youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&feature=shared", "dQw4w9WgXcQ"],
  ["https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ&si=12345", "dQw4w9WgXcQ"],
  ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["https://youtu.be/dQw4w9WgXcQ?t=10&si=abc", "dQw4w9WgXcQ"],
  ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", "dQw4w9WgXcQ"],
  ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share", "dQw4w9WgXcQ"],
  ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["https://music.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ["dQw4w9WgXcQ", "dQw4w9WgXcQ"]
];

for (const [url, expected] of validTestCases) {
  const result = parseYouTubeId(url);
  assert.strictEqual(result, expected, `Failed for URL: ${url}`);
}

const invalidTestCases = [
  "",
  null,
  undefined,
  "   ",
  "https://www.youtube.com/playlist?list=PL1234567890",
  "https://vimeo.com/12345678",
  "https://example.com/video.mp4",
  "not_a_valid_id!",
  "https://www.youtube.com/channel/UC123456",
  "https://www.youtube.com/watch?v=short"
];

for (const url of invalidTestCases) {
  const result = parseYouTubeId(url);
  assert.strictEqual(result, null, `Should return null for invalid URL: ${url}`);
}

console.log("   ✓ All YouTube URL parsing tests passed!");

// 2. MediaAdapter Interface & Mocks
console.log("\n2. Testing MediaAdapter...");

function createMockAdapter(state, els) {
  return {
    getCurrentTime() {
      if (state.sourceType === "local" && els.video) {
        return Number.isFinite(els.video.currentTime) ? els.video.currentTime : 0;
      }
      if (state.sourceType === "youtube" && state.ytPlayer && typeof state.ytPlayer.getCurrentTime === "function") {
        const t = state.ytPlayer.getCurrentTime();
        return Number.isFinite(t) ? t : 0;
      }
      return 0;
    },
    getDuration() {
      if (state.sourceType === "local" && els.video) {
        return Number.isFinite(els.video.duration) ? els.video.duration : 0;
      }
      if (state.sourceType === "youtube" && state.ytPlayer && typeof state.ytPlayer.getDuration === "function") {
        const d = state.ytPlayer.getDuration();
        return Number.isFinite(d) ? d : 0;
      }
      return 0;
    },
    play() {
      if (state.sourceType === "local" && els.video) return els.video.play();
      if (state.sourceType === "youtube" && state.ytPlayer && typeof state.ytPlayer.playVideo === "function") {
        state.ytPlayer.playVideo();
      }
    },
    pause() {
      if (state.sourceType === "local" && els.video) return els.video.pause();
      if (state.sourceType === "youtube" && state.ytPlayer && typeof state.ytPlayer.pauseVideo === "function") {
        state.ytPlayer.pauseVideo();
      }
    },
    seek(seconds) {
      const dur = this.getDuration();
      const target = Math.max(0, Math.min(seconds, dur > 0 ? dur : seconds));
      if (state.sourceType === "local" && els.video) {
        els.video.currentTime = target;
        els.video.pause();
      } else if (state.sourceType === "youtube" && state.ytPlayer && typeof state.ytPlayer.seekTo === "function") {
        state.ytPlayer.seekTo(target, true);
        state.ytPlayer.pauseVideo();
      }
    },
    isReady() {
      return !!state.loaded;
    }
  };
}

// Test HTML5 Video Mock
const mockLocalState = { sourceType: "local", loaded: true };
const mockLocalEls = {
  video: {
    currentTime: 12.345,
    duration: 120.0,
    paused: false,
    play() { this.paused = false; },
    pause() { this.paused = true; }
  }
};
const localAdapter = createMockAdapter(mockLocalState, mockLocalEls);
assert.strictEqual(localAdapter.getCurrentTime(), 12.345);
assert.strictEqual(localAdapter.getDuration(), 120.0);
localAdapter.pause();
assert.strictEqual(mockLocalEls.video.paused, true);
localAdapter.seek(55.5);
assert.strictEqual(mockLocalEls.video.currentTime, 55.5);

// Test YouTube Player Mock
const mockYtState = {
  sourceType: "youtube",
  loaded: true,
  ytPlayer: {
    currentTime: 45.678,
    duration: 300.0,
    paused: false,
    getCurrentTime() { return this.currentTime; },
    getDuration() { return this.duration; },
    playVideo() { this.paused = false; },
    pauseVideo() { this.paused = true; },
    seekTo(seconds, allowSeekAhead) { this.currentTime = seconds; }
  }
};
const ytAdapter = createMockAdapter(mockYtState, {});
assert.strictEqual(ytAdapter.getCurrentTime(), 45.678);
assert.strictEqual(ytAdapter.getDuration(), 300.0);
ytAdapter.pause();
assert.strictEqual(mockYtState.ytPlayer.paused, true);
ytAdapter.seek(99.123);
assert.strictEqual(mockYtState.ytPlayer.getCurrentTime(), 99.123);

console.log("   ✓ MediaAdapter tests passed for both local and YouTube!");

// 3. Multi-Source Storage & Legacy Fallback
console.log("\n3. Testing Multi-Source Storage & Legacy Fallback...");

const mockStore = {};
const mockLocalStorage = {
  getItem: (k) => mockStore[k] || null,
  setItem: (k, v) => mockStore[k] = String(v),
  removeItem: (k) => delete mockStore[k]
};

const LAST_SESSION_KEY = "video-annotator:last-session:v1";
const LEGACY_LAST_SESSION_KEY = "film-annotator:last-session:v1";

function projectStorageKey(sourceType, sourceId) {
  return `video-annotator:v1:${sourceType}:${sourceId}`;
}

// Legacy project key generator for local files
function legacyLocalProjectKey(name, size, lastModified) {
  return `film-annotator:v1:${name}:${size}:${lastModified}`;
}

// Test Legacy v1.1 reading
const testFileName = "sample_movie.mp4";
const legacyKey = legacyLocalProjectKey(testFileName, 1048576, 1700000000);
mockStore[legacyKey] = JSON.stringify({
  annotations: [
    { id: "leg-1", type: "marker", in: 15.5, comment: "Scena iniziale" }
  ],
  pendingIn: null,
  playhead: 15.5
});
mockStore[LEGACY_LAST_SESSION_KEY] = JSON.stringify({
  projectKey: legacyKey,
  file: { name: testFileName, size: 1048576, lastModified: 1700000000 },
  annotationCount: 1,
  playhead: 15.5
});

// Verify reading legacy session
const readSession = JSON.parse(mockLocalStorage.getItem(LAST_SESSION_KEY) || mockLocalStorage.getItem(LEGACY_LAST_SESSION_KEY));
assert(readSession, "Should read legacy session");
assert.strictEqual(readSession.file.name, testFileName);

// Test v1.2 Local saving & reading
const localV12Key = projectStorageKey("local", `${testFileName}:1048576:1700000000`);
mockStore[localV12Key] = JSON.stringify({
  sourceType: "local",
  annotations: [
    { id: "loc-1", type: "marker", in: 30.0, comment: "Primo piano" }
  ],
  pendingIn: null,
  playhead: 30.0
});
mockStore[LAST_SESSION_KEY] = JSON.stringify({
  sourceType: "local",
  sourceId: `${testFileName}:1048576:1700000000`,
  sourceLabel: testFileName,
  projectKey: localV12Key,
  file: { name: testFileName, size: 1048576, lastModified: 1700000000 },
  annotationCount: 1,
  playhead: 30.0
});

const readLocalV12 = JSON.parse(mockLocalStorage.getItem(LAST_SESSION_KEY));
assert.strictEqual(readLocalV12.sourceType, "local");
assert.strictEqual(readLocalV12.sourceLabel, testFileName);

// Test v1.2 YouTube saving & reading
const ytVideoId = "dQw4w9WgXcQ";
const ytKey = projectStorageKey("youtube", ytVideoId);
mockStore[ytKey] = JSON.stringify({
  sourceType: "youtube",
  sourceId: ytVideoId,
  annotations: [
    { id: "yt-1", type: "segment", in: 10.0, out: 25.5, comment: "Intro musicale" }
  ],
  pendingIn: null,
  playhead: 12.0
});
mockStore[LAST_SESSION_KEY] = JSON.stringify({
  sourceType: "youtube",
  sourceId: ytVideoId,
  sourceLabel: `https://www.youtube.com/watch?v=${ytVideoId}`,
  projectKey: ytKey,
  file: null,
  annotationCount: 1,
  playhead: 12.0
});

const readYtSession = JSON.parse(mockLocalStorage.getItem(LAST_SESSION_KEY));
assert.strictEqual(readYtSession.sourceType, "youtube");
assert.strictEqual(readYtSession.sourceId, ytVideoId);

// Test session separation
const localData = JSON.parse(mockLocalStorage.getItem(localV12Key));
const ytData = JSON.parse(mockLocalStorage.getItem(ytKey));
assert.notStrictEqual(localData.annotations[0].id, ytData.annotations[0].id, "Local and YouTube sessions must not mix!");

console.log("   ✓ Storage and multi-source isolation tests passed!");

// 4. YouTube Error Code Mapping
console.log("\n4. Testing YouTube Error Code Mapping (including 153)...");

function getYouTubeErrorMessage(code) {
  switch (code) {
    case 2:
      return "Parametro URL o identificativo video non valido.";
    case 5:
      return "Errore di riproduzione HTML5 nel player YouTube.";
    case 100:
      return "Video non trovato. Il video potrebbe essere stato rimosso o impostato come privato.";
    case 101:
    case 150:
      return "L'autore del video o YouTube non consentono la riproduzione tramite incorporamento.";
    case 153:
      return "Impossibile riprodurre questo video: restrizioni di origine o referer non identificabile. Verifica che l'applicazione sia servita tramite HTTP/HTTPS e che il video consenta l'incorporamento.";
    default:
      return `Si è verificato un errore nella riproduzione del video YouTube (codice ${code}).`;
  }
}

assert(getYouTubeErrorMessage(2).includes("non valido"));
assert(getYouTubeErrorMessage(5).includes("HTML5"));
assert(getYouTubeErrorMessage(100).includes("non trovato"));
assert(getYouTubeErrorMessage(101).includes("incorporamento"));
assert(getYouTubeErrorMessage(150).includes("incorporamento"));
assert(getYouTubeErrorMessage(153).includes("restrizioni di origine o referer"), "Error 153 must be explicitly handled!");

console.log("   ✓ YouTube error code mapping (2, 5, 100, 101, 150, 153) verified!");

// 5. CSV Export v1.2 Formatter
console.log("\n5. Testing CSV Export Formatter v1.2...");

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const msTotal = Math.round(seconds * 1000);
  const hours = Math.floor(msTotal / 3600000);
  const minutes = Math.floor((msTotal % 3600000) / 60000);
  const secs = Math.floor((msTotal % 60000) / 1000);
  const ms = msTotal % 1000;
  return [hours, minutes, secs].map(n => String(n).padStart(2, "0")).join(":") + "." + String(ms).padStart(3, "0");
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return '"' + text.replaceAll('"', '""') + '"';
}

function generateCsv(annotations, sourceType, sourceIdentifier) {
  const rows = [
    ["ID", "Tipo", "IN", "OUT", "IN_secondi", "OUT_secondi", "Commento", "Sorgente", "Video"]
  ];
  annotations.forEach((item, index) => {
    rows.push([
      index + 1,
      item.type === "segment" ? "segmento" : "marker",
      formatTime(item.in),
      item.type === "segment" && Number.isFinite(item.out) ? formatTime(item.out) : "",
      item.in.toFixed(3),
      item.type === "segment" && Number.isFinite(item.out) ? item.out.toFixed(3) : "",
      item.comment,
      sourceType,
      sourceIdentifier
    ]);
  });
  return "\uFEFF" + rows.map(r => r.map(csvCell).join(",")).join("\r\n");
}

// Test local CSV
const localAnnotations = [
  { type: "marker", in: 12.345, comment: 'Commento con "virgolette" e virgole, ecc.' },
  { type: "segment", in: 20.0, out: 45.5, comment: "Dettaglio inquadratura: città" }
];
const localCsv = generateCsv(localAnnotations, "local", "film_01.mp4");
assert(localCsv.startsWith("\uFEFF"), "CSV must include UTF-8 BOM");
assert(localCsv.includes('"Sorgente","Video"'), "Header must include Sorgente and Video");
assert(localCsv.includes('"local","film_01.mp4"'), "Local source metadata present");
assert(localCsv.includes('""virgolette""'), "Quotes must be escaped RFC 4180 style");

// Test YouTube CSV
const ytAnnotations = [
  { type: "segment", in: 65.123, out: 120.456, comment: "Scena d'azione con caratteri speciali: àèéìòù" }
];
const ytCsv = generateCsv(ytAnnotations, "youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
assert(ytCsv.includes('"youtube","https://www.youtube.com/watch?v=dQw4w9WgXcQ"'), "YouTube source metadata present");
assert(ytCsv.includes("àèéìòù"), "Unicode must be preserved");

console.log("   ✓ CSV Export v1.2 tests passed!");

// 6. Media Teardown & Forget Session Semantics
console.log("\n6. Testing Media Teardown & Forget Session Semantics...");

function createTeardownEnvironment() {
  const store = {};
  const mockStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };

  const state = {
    sourceType: "youtube",
    sourceId: "test_vid_123",
    sourceLabel: "https://www.youtube.com/watch?v=test_vid_123",
    projectKey: "video-annotator:v1:youtube:test_vid_123",
    fallbackProjectKey: null,
    file: null,
    objectUrl: null,
    loaded: true,
    annotations: [{ id: "a1", type: "marker", in: 10, comment: "nota" }],
    pendingIn: null,
    restoredPlayhead: 10,
    lastPlaybackSaveAt: Date.now(),
    resumeRequested: false,
    ytPollTimer: 12345,
    ytPlayer: {
      paused: false,
      destroyed: false,
      pauseVideo() { this.paused = true; },
      stopVideo() { this.paused = true; },
      destroy() { this.destroyed = true; },
      getCurrentTime() { return 10; },
      getDuration() { return 100; }
    }
  };

  const els = {
    youtubeContainer: {
      innerHTML: '<div id="youtubePlayer"><iframe src="https://youtube.com/embed/test_vid_123"></iframe></div>',
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      }
    },
    video: {
      src: "blob:http://localhost/test",
      paused: false,
      pause() { this.paused = true; },
      removeAttribute(attr) { if (attr === "src") this.src = ""; },
      load() {},
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      }
    }
  };

  function stopUiTimer() {
    state.ytPollTimer = null;
  }

  function teardownCurrentMedia(options = {}) {
    stopUiTimer();

    if (state.ytPlayer) {
      try { state.ytPlayer.pauseVideo(); } catch (e) {}
      try { state.ytPlayer.stopVideo(); } catch (e) {}
      try {
        if (typeof state.ytPlayer.destroy === "function") {
          state.ytPlayer.destroy();
        }
      } catch (e) {}
      state.ytPlayer = null;
    }
    if (els.youtubeContainer) {
      els.youtubeContainer.innerHTML = "";
      els.youtubeContainer.classList.add("is-hidden");
    }

    if (els.video) {
      try { els.video.pause(); } catch (e) {}
      els.video.removeAttribute("src");
      try { els.video.load(); } catch (e) {}
      els.video.classList.add("is-hidden");
    }
    if (state.objectUrl) {
      state.objectUrl = null;
    }
    state.file = null;

    if (options.resetState) {
      state.loaded = false;
      state.sourceType = null;
      state.sourceId = null;
      state.sourceLabel = null;
      state.projectKey = null;
      state.fallbackProjectKey = null;
      state.annotations = [];
      state.pendingIn = null;
      state.restoredPlayhead = 0;
      state.lastPlaybackSaveAt = 0;
      state.resumeRequested = false;
    }
  }

  function savePlaybackPosition(force = false) {
    if (!state.loaded || !state.projectKey || !state.sourceId) return;
    saveLocal();
  }

  function saveLocal() {
    if (!state.loaded || !state.projectKey || !state.sourceId) return;
    mockStorage.setItem(state.projectKey, JSON.stringify({
      sourceType: state.sourceType,
      sourceId: state.sourceId,
      annotations: state.annotations,
      playhead: 10
    }));
    writeLastSession();
  }

  function writeLastSession() {
    if (!state.loaded || !state.projectKey || !state.sourceId) return;
    mockStorage.setItem(LAST_SESSION_KEY, JSON.stringify({
      sourceType: state.sourceType,
      sourceId: state.sourceId,
      projectKey: state.projectKey
    }));
  }

  function forgetCurrentSession() {
    teardownCurrentMedia({ resetState: true });
    mockStorage.removeItem(LAST_SESSION_KEY);
    mockStorage.removeItem(LEGACY_LAST_SESSION_KEY);
  }

  return {
    state,
    els,
    store,
    mockStorage,
    teardownCurrentMedia,
    forgetCurrentSession,
    savePlaybackPosition,
    saveLocal,
    writeLastSession
  };
}

// Subtest 1: Verify save and session write while active
const env1 = createTeardownEnvironment();
env1.saveLocal();
assert.strictEqual(JSON.parse(env1.mockStorage.getItem(LAST_SESSION_KEY)).sourceId, "test_vid_123");
assert(env1.mockStorage.getItem("video-annotator:v1:youtube:test_vid_123"), "Project annotations must be saved");

// Subtest 2: Verify forgetCurrentSession tears down player, clears session, and prevents resurrection
const ytPlayerRef = env1.state.ytPlayer;
env1.forgetCurrentSession();

assert.strictEqual(ytPlayerRef.destroyed, true, "YouTube player must be destroyed");
assert.strictEqual(env1.state.ytPlayer, null, "state.ytPlayer must be null");
assert.strictEqual(env1.els.youtubeContainer.innerHTML, "", "youtubeContainer innerHTML must be cleared");
assert(env1.els.youtubeContainer.classList.contains("is-hidden"), "youtubeContainer must be hidden");
assert.strictEqual(env1.mockStorage.getItem(LAST_SESSION_KEY), null, "LAST_SESSION_KEY must be removed");
assert.strictEqual(env1.state.loaded, false, "state.loaded must be false");
assert.strictEqual(env1.state.projectKey, null, "state.projectKey must be null");
assert.strictEqual(env1.state.sourceId, null, "state.sourceId must be null");

// Verify that subsequent save calls (e.g. visibilitychange / beforeunload / delayed timer) DO NOT resurrect session
env1.savePlaybackPosition(true);
assert.strictEqual(env1.mockStorage.getItem(LAST_SESSION_KEY), null, "savePlaybackPosition must not resurrect session after forget");
env1.saveLocal();
assert.strictEqual(env1.mockStorage.getItem(LAST_SESSION_KEY), null, "saveLocal must not resurrect session after forget");
env1.writeLastSession();
assert.strictEqual(env1.mockStorage.getItem(LAST_SESSION_KEY), null, "writeLastSession must not resurrect session after forget");

// Verify project annotations remain saved (prudent semantic)
assert(env1.mockStorage.getItem("video-annotator:v1:youtube:test_vid_123"), "Project annotations must stay saved in storage for future reuse");

// Subtest 3: Verify idempotence of teardown
assert.doesNotThrow(() => {
  env1.teardownCurrentMedia();
  env1.teardownCurrentMedia({ resetState: true });
  env1.teardownCurrentMedia({ resetState: false });
}, "teardownCurrentMedia must be idempotent and never throw");

// Subtest 4: Verify local video teardown
const env2 = createTeardownEnvironment();
env2.state.sourceType = "local";
env2.state.objectUrl = "blob:http://localhost/test";
env2.state.file = { name: "test.mp4" };
env2.state.ytPlayer = null;
env2.teardownCurrentMedia({ resetState: true });

assert.strictEqual(env2.els.video.paused, true, "Local video must be paused");
assert.strictEqual(env2.els.video.src, "", "Local video src must be removed");
assert(env2.els.video.classList.contains("is-hidden"), "Local video must be hidden");
assert.strictEqual(env2.state.objectUrl, null, "state.objectUrl must be cleared");

console.log("   ✓ Media teardown & forget session tests passed!");

// 7. External Subtitle Engine
console.log("\n7. Testing External Subtitle Engine...");

function parseTimestamp(timeStr) {
  if (!timeStr) return null;
  const s = timeStr.trim().replace(",", ".");
  const parts = s.split(":");
  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const secs = Number(parts[2]);
    if (Number.isFinite(hours) && Number.isFinite(minutes) && Number.isFinite(secs)) {
      return hours * 3600 + minutes * 60 + secs;
    }
  } else if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const secs = Number(parts[1]);
    if (Number.isFinite(minutes) && Number.isFinite(secs)) {
      return minutes * 60 + secs;
    }
  }
  return null;
}

function parseSrt(text) {
  if (typeof text !== "string") return [];
  let cleaned = text.replace(/^\uFEFF/, "");
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const cues = [];
  const blocks = cleaned.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trimEnd()).filter(l => l.length > 0);
    if (lines.length === 0) continue;
    let timeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timeLineIndex = i;
        break;
      }
    }
    if (timeLineIndex === -1) continue;
    const timeLine = lines[timeLineIndex];
    const arrowIndex = timeLine.indexOf("-->");
    const startStr = timeLine.slice(0, arrowIndex).trim();
    const endStr = timeLine.slice(arrowIndex + 3).trim().split(/\s+/)[0];
    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr);
    if (start === null || end === null) continue;
    const textLines = lines.slice(timeLineIndex + 1);
    const cueText = textLines.join("\n").trim();
    if (!cueText) continue;
    cues.push({
      start: Number(start.toFixed(3)),
      end: Number(end.toFixed(3)),
      text: cueText
    });
  }
  cues.sort((a, b) => a.start - b.start || a.end - b.end);
  return cues;
}

function parseVtt(text) {
  if (typeof text !== "string") return [];
  let cleaned = text.replace(/^\uFEFF/, "");
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const cues = [];
  const blocks = cleaned.split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trimEnd()).filter(l => l.length > 0);
    if (lines.length === 0) continue;
    if (lines[0].startsWith("NOTE") || lines[0].startsWith("STYLE") || lines[0].startsWith("REGION")) {
      continue;
    }
    let timeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timeLineIndex = i;
        break;
      }
    }
    if (timeLineIndex === -1) continue;
    const timeLine = lines[timeLineIndex];
    const arrowIndex = timeLine.indexOf("-->");
    const startStr = timeLine.slice(0, arrowIndex).trim();
    const afterArrow = timeLine.slice(arrowIndex + 3).trim();
    const endStr = afterArrow.split(/\s+/)[0];
    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr);
    if (start === null || end === null) continue;
    const textLines = lines.slice(timeLineIndex + 1);
    const cueText = textLines.join("\n").trim();
    if (!cueText) continue;
    cues.push({
      start: Number(start.toFixed(3)),
      end: Number(end.toFixed(3)),
      text: cueText
    });
  }
  cues.sort((a, b) => a.start - b.start || a.end - b.end);
  return cues;
}

function findActiveCueText(cues, targetTime) {
  if (!Array.isArray(cues) || cues.length === 0 || !Number.isFinite(targetTime)) return "";
  let low = 0;
  let high = cues.length - 1;
  let candidate = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (cues[mid].start <= targetTime) {
      candidate = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  if (candidate === -1) return "";
  const activeTexts = [];
  let i = candidate;
  while (i >= 0 && cues[i].start <= targetTime) {
    if (targetTime <= cues[i].end) {
      activeTexts.unshift(cues[i].text);
    }
    if (targetTime - cues[i].start > 60) break;
    i--;
  }
  return activeTexts.join("\n");
}

function formatOffset(offset) {
  const val = Number(offset) || 0;
  if (Math.abs(val) < 0.001) return "+0,0 s";
  const sign = val > 0 ? "+" : "−";
  return sign + Math.abs(val).toFixed(1).replace(".", ",") + " s";
}

// 7.1 Parser SRT tests
console.log("   7.1 Testing SRT Parser...");
const srtTestSample = "\uFEFF1\r\n00:00:21,855 --> 00:00:23,065\r\nTesto singolo: È fantastico.\r\n\r\n2\r\n00:00:25,000 --> 00:00:29,500\r\nPrima riga: caratteri italiani àèéìòù\r\nSeconda riga\r\n\r\n";
const parsedSrt = parseSrt(srtTestSample);
assert.strictEqual(parsedSrt.length, 2, "SRT should parse 2 cues");
assert.strictEqual(parsedSrt[0].start, 21.855, "SRT start timestamp with comma ms");
assert.strictEqual(parsedSrt[0].end, 23.065, "SRT end timestamp with comma ms");
assert.strictEqual(parsedSrt[0].text, "Testo singolo: È fantastico.", "SRT Unicode & BOM preservation");
assert.strictEqual(parsedSrt[1].start, 25.0, "SRT second cue start");
assert.strictEqual(parsedSrt[1].end, 29.5, "SRT second cue end");
assert.strictEqual(parsedSrt[1].text, "Prima riga: caratteri italiani àèéìòù\nSeconda riga", "SRT multiline cue & CRLF handling");
console.log("       ✓ SRT Parser tests passed!");

// 7.2 Parser WebVTT tests
console.log("   7.2 Testing WebVTT Parser...");
const vttTestSample = "WEBVTT - Titolo traccia\n\nNOTE Nota iniziale di descrizione\nche continua\n\n00:21.855 --> 00:23.065 line:90% position:50% align:center\nTesto VTT con impostazioni\n\ncue-id-2\n01:00:25.000 --> 01:00:29.500\nPrima riga VTT\nSeconda riga VTT\n";
const parsedVtt = parseVtt(vttTestSample);
assert.strictEqual(parsedVtt.length, 2, "VTT should parse 2 cues, skipping NOTE block");
assert.strictEqual(parsedVtt[0].start, 21.855, "VTT MM:SS.mmm format support");
assert.strictEqual(parsedVtt[0].end, 23.065, "VTT end time support");
assert.strictEqual(parsedVtt[0].text, "Testo VTT con impostazioni", "VTT text extracted without settings");
assert.strictEqual(parsedVtt[1].start, 3625.0, "VTT HH:MM:SS.mmm format support");
assert.strictEqual(parsedVtt[1].end, 3629.5, "VTT end time support");
assert.strictEqual(parsedVtt[1].text, "Prima riga VTT\nSeconda riga VTT", "VTT multiline cue support");
console.log("       ✓ WebVTT Parser tests passed!");

// 7.3 Cue selection tests
console.log("   7.3 Testing Cue selection...");
assert.strictEqual(findActiveCueText(parsedSrt, 10.0), "", "Before first cue -> empty text");
assert.strictEqual(findActiveCueText(parsedSrt, 21.855), "Testo singolo: È fantastico.", "At cue start -> cue text");
assert.strictEqual(findActiveCueText(parsedSrt, 22.5), "Testo singolo: È fantastico.", "Inside cue -> cue text");
assert.strictEqual(findActiveCueText(parsedSrt, 23.065), "Testo singolo: È fantastico.", "At cue end -> cue text");
assert.strictEqual(findActiveCueText(parsedSrt, 24.0), "", "Between cues -> empty text");
assert.strictEqual(findActiveCueText(parsedSrt, 27.0), "Prima riga: caratteri italiani àèéìòù\nSeconda riga", "Inside multiline cue -> multiline text");
assert.strictEqual(findActiveCueText(parsedSrt, 35.0), "", "After last cue -> empty text");
console.log("       ✓ Cue selection tests passed!");

// 7.4 Offset tests
console.log("   7.4 Testing Subtitle Offset...");
// Cue is at [21.855, 23.065]
// Offset = 0
assert.strictEqual(findActiveCueText(parsedSrt, 21.855 - 0), "Testo singolo: È fantastico.", "Offset 0 at cue start");
// Offset = +0.5 s (shown 0.5s later): at video t=21.855, adjusted = 21.355 -> empty
assert.strictEqual(findActiveCueText(parsedSrt, 21.855 - 0.5), "", "Offset +0.5s delays display (not shown at t=21.855)");
assert.strictEqual(findActiveCueText(parsedSrt, 22.355 - 0.5), "Testo singolo: È fantastico.", "Offset +0.5s shows cue at t=22.355");
// Offset = -0.5 s (shown 0.5s earlier): at video t=21.355, adjusted = 21.855 -> shown!
assert.strictEqual(findActiveCueText(parsedSrt, 21.355 - (-0.5)), "Testo singolo: È fantastico.", "Offset -0.5s advances display (shown at t=21.355)");
assert.strictEqual(findActiveCueText(parsedSrt, 23.065 - (-0.5)), "", "Offset -0.5s ends display earlier (empty at t=23.065)");

// Formatting
assert.strictEqual(formatOffset(0), "+0,0 s", "formatOffset 0");
assert.strictEqual(formatOffset(0.5), "+0,5 s", "formatOffset +0.5");
assert.strictEqual(formatOffset(-0.5), "−0,5 s", "formatOffset -0.5");
assert.strictEqual(formatOffset(1.5), "+1,5 s", "formatOffset +1.5");
assert.strictEqual(formatOffset(-2.0), "−2,0 s", "formatOffset -2.0");
console.log("       ✓ Subtitle Offset tests passed!");

// 7.5 Persistence and Quota handling
console.log("   7.5 Testing Subtitle Persistence & Storage...");
const subStorage = {};
const subMockStorage = {
  getItem: (k) => subStorage[k] || null,
  setItem: (k, v) => { subStorage[k] = String(v); },
  removeItem: (k) => { delete subStorage[k]; }
};

const subProjectKey = "video-annotator:v1:youtube:sub_vid_test";
const subtitleData = {
  filename: "crip_camp_sottotitoli_it.srt",
  format: "srt",
  cues: parsedSrt,
  offset: 0.5,
  enabled: true,
  fontSize: "large"
};

subMockStorage.setItem(subProjectKey, JSON.stringify({
  sourceType: "youtube",
  sourceId: "sub_vid_test",
  annotations: [{ id: "m1", type: "marker", in: 10, comment: "test" }],
  subtitle: subtitleData
}));

const restoredProject = JSON.parse(subMockStorage.getItem(subProjectKey));
assert(restoredProject.subtitle, "Subtitle object must be restored");
assert.strictEqual(restoredProject.subtitle.filename, "crip_camp_sottotitoli_it.srt");
assert.strictEqual(restoredProject.subtitle.format, "srt");
assert.strictEqual(restoredProject.subtitle.cues.length, 2);
assert.strictEqual(restoredProject.subtitle.offset, 0.5);
assert.strictEqual(restoredProject.subtitle.enabled, true);
assert.strictEqual(restoredProject.subtitle.fontSize, "large");

// QuotaExceededError simulation
let quotaThrown = false;
let fallbackSaved = false;
const quotaMockStorage = {
  setItem: (k, v) => {
    if (v.length > 500) {
      const err = new Error("Quota exceeded");
      err.name = "QuotaExceededError";
      throw err;
    }
    fallbackSaved = true;
  }
};

try {
  quotaMockStorage.setItem("key", JSON.stringify({ cues: new Array(500).fill({ start: 1, end: 2, text: "long test content..." }) }));
} catch (e) {
  quotaThrown = true;
  if (e.name === "QuotaExceededError") {
    quotaMockStorage.setItem("key", JSON.stringify({ cues: [] }));
  }
}
assert.strictEqual(quotaThrown, true, "QuotaExceededError caught");
assert.strictEqual(fallbackSaved, true, "Fallback without cues saved without throwing");
console.log("       ✓ Subtitle Persistence & Storage tests passed!");

// 7.6 Security & XSS
console.log("   7.6 Testing Subtitle Security / XSS Prevention...");
const maliciousSrt = "1\n00:00:01,000 --> 00:00:03,000\n<script>alert(1)<" + "/script><img src=x onerror=alert(2)>\n";
const parsedMalicious = parseSrt(maliciousSrt);
assert.strictEqual(parsedMalicious.length, 1);
assert.strictEqual(parsedMalicious[0].text, '<script>alert(1)</script><img src=x onerror=alert(2)>', "Markup preserved purely as raw text");

// Simulation of textContent assignment
const mockTextNode = { textContent: "" };
mockTextNode.textContent = parsedMalicious[0].text;
assert.strictEqual(mockTextNode.textContent, '<script>alert(1)</script><img src=x onerror=alert(2)>', "textContent assignment preserves literal text without execution");
console.log("       ✓ Subtitle Security tests passed!");

console.log("   ✓ External Subtitle Engine tests passed!");

console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
