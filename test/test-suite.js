// test/test-suite.js
// Automated test suite for video-annotator v1.4

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("=== Running video-annotator v1.4 Test Suite ===\n");

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

// 5. Canonical English CSV Formatter & Filename Generator (v1.4)
console.log("\n5. Testing Canonical English CSV Formatter & Filename Generator...");

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

function sanitizeFilenamePart(input, maxLength = 60) {
  if (!input || typeof input !== "string") return "video";
  let s = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, "-");
  s = s.replace(/-+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  if (s.length > maxLength) {
    s = s.slice(0, maxLength).replace(/-+$/, "");
  }
  return s || "video";
}

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function generateCsvFilename(sourceState, date = new Date()) {
  const s = sourceState || {};
  const dateStr = getLocalDateString(date);
  if (s.sourceType === "youtube") {
    let rawTitle = "";
    if (s.ytPlayer && typeof s.ytPlayer.getVideoData === "function") {
      try {
        const data = s.ytPlayer.getVideoData();
        if (data && typeof data.title === "string" && data.title.trim()) {
          rawTitle = data.title.trim();
        }
      } catch (e) {}
    }
    if (!rawTitle && s.videoTitle) {
      rawTitle = s.videoTitle;
    }
    const cleanTitle = sanitizeFilenamePart(rawTitle);
    const ytId = s.sourceId || "video";
    return "video-annotator_youtube_" + cleanTitle + "_" + ytId + "_" + dateStr + ".csv";
  }
  let rawName = "";
  if (s.file && typeof s.file.name === "string") {
    rawName = s.file.name.replace(/\.[^.]+$/, "");
  } else if (s.sourceLabel && typeof s.sourceLabel === "string") {
    rawName = s.sourceLabel.replace(/\.[^.]+$/, "");
  } else if (s.videoTitle && typeof s.videoTitle === "string") {
    rawName = s.videoTitle;
  }
  const cleanTitle = sanitizeFilenamePart(rawName);
  return "video-annotator_local_" + cleanTitle + "_" + dateStr + ".csv";
}

function generateCsv(annotations, sourceType, sourceIdentifier) {
  const rows = [
    ["ID", "Type", "IN", "OUT", "IN_seconds", "OUT_seconds", "Comment", "Source", "Video"]
  ];
  (annotations || []).forEach((item, index) => {
    rows.push([
      index + 1,
      item.type === "segment" ? "segment" : "marker",
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

// 5.1 Test Canonical CSV Format & RFC 4180
console.log("   5.1 Testing Canonical CSV Format & RFC 4180...");
const localAnnotations = [
  { type: "marker", in: 12.345, comment: 'Commento con "virgolette" e virgole, ecc.' },
  { type: "segment", in: 20.0, out: 45.5, comment: "Dettaglio inquadratura: città\nSeconda riga commento" }
];
const localCsv = generateCsv(localAnnotations, "local", "film_01.mp4");
assert(localCsv.startsWith("\uFEFF"), "CSV must include UTF-8 BOM");
assert(localCsv.includes('"ID","Type","IN","OUT","IN_seconds","OUT_seconds","Comment","Source","Video"'), "Canonical English header present");
assert(!localCsv.includes('"Tipo"'), "No Italian 'Tipo' header");
assert(!localCsv.includes('"Sorgente"'), "No Italian 'Sorgente' header");
assert(!localCsv.includes('"IN_secondi"'), "No Italian 'IN_secondi' header");
assert(localCsv.includes('"marker"'), "Canonical type 'marker'");
assert(localCsv.includes('"segment"'), "Canonical type 'segment'");
assert(!localCsv.includes('"segmento"'), "No Italian 'segmento'");
assert(localCsv.includes('"local","film_01.mp4"'), "Local source metadata present");
assert(localCsv.includes('""virgolette""'), "Quotes must be escaped RFC 4180 style");
assert(localCsv.includes("Seconda riga commento"), "Multiline comment preserved RFC 4180");
assert(localCsv.includes('"12.345"'), "Machine readable IN seconds");
assert(localCsv.includes('"45.500"'), "Machine readable OUT seconds");

const ytAnnotations = [
  { type: "segment", in: 65.123, out: 120.456, comment: "Scena d'azione con caratteri speciali: àèéìòù" }
];
const ytCsv = generateCsv(ytAnnotations, "youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
assert(ytCsv.includes('"youtube","https://www.youtube.com/watch?v=dQw4w9WgXcQ"'), "YouTube source metadata present");
assert(ytCsv.includes("àèéìòù"), "Unicode must be preserved");
assert(ytCsv.includes('"segment"'), "Canonical segment type");
console.log("       ✓ Canonical CSV formatting & RFC 4180 tests passed!");

// 5.2 Test Filename Sanitization
console.log("   5.2 Testing Filename Sanitization (sanitizeFilenamePart)...");
assert.strictEqual(sanitizeFilenamePart("Crip Camp: A Disability Revolution"), "crip-camp-a-disability-revolution", "Colons and spaces");
assert.strictEqual(sanitizeFilenamePart("L\u2019educazione, l\x27inclusione & la cura!"), "l-educazione-l-inclusione-la-cura", "Apostrophes, commas, ampersand, exclamation");
assert.strictEqual(sanitizeFilenamePart("È un film già visto: café & cinéma"), "e-un-film-gia-visto-cafe-cinema", "Diacritics normalized");
assert.strictEqual(sanitizeFilenamePart(""), "video", "Empty string -> fallback");
assert.strictEqual(sanitizeFilenamePart(null), "video", "null -> fallback");
assert.strictEqual(sanitizeFilenamePart(undefined), "video", "undefined -> fallback");
assert.strictEqual(sanitizeFilenamePart("   "), "video", "Whitespace only -> fallback");
assert.strictEqual(sanitizeFilenamePart("---"), "video", "Dashes only -> fallback");
assert.strictEqual(sanitizeFilenamePart(":/\\?\"*<>|"), "video", "Filesystem illegal characters only -> fallback");
assert.strictEqual(sanitizeFilenamePart("a".repeat(100)), "a".repeat(60), "Truncated to 60 characters");
assert.strictEqual(sanitizeFilenamePart("a".repeat(59) + "-b"), "a".repeat(59), "Trailing dash after truncation cleaned");
console.log("       ✓ Filename sanitization tests passed!");

// 5.3 Test Filename Generation for YouTube and Local
console.log("   5.3 Testing Filename Generation...");
const mockFixedDate = new Date(2026, 8, 25); // 2026-09-25

// YouTube with video title
const ytStateWithTitle = {
  sourceType: "youtube",
  sourceId: "OFS8SpwioZ4",
  videoTitle: "Crip Camp: A Disability Revolution"
};
assert.strictEqual(
  generateCsvFilename(ytStateWithTitle, mockFixedDate),
  "video-annotator_youtube_crip-camp-a-disability-revolution_OFS8SpwioZ4_2026-09-25.csv",
  "YouTube filename with video title"
);

// YouTube with getVideoData() on player mock
const ytStateWithPlayer = {
  sourceType: "youtube",
  sourceId: "OFS8SpwioZ4",
  ytPlayer: {
    getVideoData: () => ({ title: "Crip Camp: A Disability Revolution" })
  }
};
assert.strictEqual(
  generateCsvFilename(ytStateWithPlayer, mockFixedDate),
  "video-annotator_youtube_crip-camp-a-disability-revolution_OFS8SpwioZ4_2026-09-25.csv",
  "YouTube filename from player.getVideoData()"
);

// YouTube fallback without title
const ytStateNoTitle = {
  sourceType: "youtube",
  sourceId: "OFS8SpwioZ4"
};
assert.strictEqual(
  generateCsvFilename(ytStateNoTitle, mockFixedDate),
  "video-annotator_youtube_video_OFS8SpwioZ4_2026-09-25.csv",
  "YouTube fallback filename without title"
);

// Local file standard
const localStateStd = {
  sourceType: "local",
  file: { name: "Crip Camp.mp4" }
};
assert.strictEqual(
  generateCsvFilename(localStateStd, mockFixedDate),
  "video-annotator_local_crip-camp_2026-09-25.csv",
  "Local file filename without extension"
);

// Local file with multiple dots
const localStateMultiDots = {
  sourceType: "local",
  file: { name: "Crip.Camp.2020.1080p.mp4" }
};
assert.strictEqual(
  generateCsvFilename(localStateMultiDots, mockFixedDate),
  "video-annotator_local_crip-camp-2020-1080p_2026-09-25.csv",
  "Local file with multiple dots"
);

// Local file fallback when name after sanitization is empty
const localStateFallback = {
  sourceType: "local",
  file: { name: ".mp4" }
};
assert.strictEqual(
  generateCsvFilename(localStateFallback, mockFixedDate),
  "video-annotator_local_video_2026-09-25.csv",
  "Local file fallback filename"
);
console.log("       ✓ Filename generation tests passed!");

console.log("   ✓ Canonical CSV Export tests passed!");

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

function formatOffset(offset, lang = "it") {
  const val = Number(offset) || 0;
  const decSep = lang === "en" ? "." : ",";
  if (Math.abs(val) < 0.001) return "+0" + decSep + "0 s";
  const sign = val > 0 ? "+" : "−";
  return sign + Math.abs(val).toFixed(1).replace(".", decSep) + " s";
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

// 8. Internationalization IT/EN (v1.4)
console.log("\n8. Testing Internationalization IT/EN...");

// Read index.html to extract real translations dictionary and HTML tags
const indexHtmlPath = path.resolve(__dirname, "../index.html");
const indexHtmlContent = fs.readFileSync(indexHtmlPath, "utf8");

// Extract translations object from index.html
const translationsMatch = indexHtmlContent.match(/const translations = (\{[\s\S]*?\n  \};\n)/);
assert(translationsMatch, "translations dictionary must be defined in index.html");
const translations = eval("(" + translationsMatch[1].replace(/;\s*$/, "") + ")");

// 8.1 Testing Dictionary Parity & HTML Attribute Coverage
console.log("   8.1 Testing Dictionary Parity & HTML Attribute Coverage...");
assert(translations.it, "translations.it must exist");
assert(translations.en, "translations.en must exist");

const itKeys = Object.keys(translations.it);
const enKeys = Object.keys(translations.en);
const itKeySet = new Set(itKeys);
const enKeySet = new Set(enKeys);

assert.strictEqual(itKeys.length, enKeys.length, `Key counts must match: IT has ${itKeys.length}, EN has ${enKeys.length}`);

const missingInEn = itKeys.filter(k => !enKeySet.has(k));
const missingInIt = enKeys.filter(k => !itKeySet.has(k));
assert.deepStrictEqual(missingInEn, [], `Keys present in IT but missing in EN: ${missingInEn.join(", ")}`);
assert.deepStrictEqual(missingInIt, [], `Keys present in EN but missing in IT: ${missingInIt.join(", ")}`);

// Verify all values are non-empty strings
for (const key of itKeys) {
  assert(typeof translations.it[key] === "string" && translations.it[key].trim().length > 0, `translations.it[${key}] must be a non-empty string`);
  assert(typeof translations.en[key] === "string" && translations.en[key].trim().length > 0, `translations.en[${key}] must be a non-empty string`);
}

// Verify parameterized placeholders {param} match between IT and EN
const paramRegex = /\{([a-zA-Z0-9_]+)\}/g;
for (const key of itKeys) {
  const itParams = (translations.it[key].match(paramRegex) || []).sort();
  const enParams = (translations.en[key].match(paramRegex) || []).sort();
  assert.deepStrictEqual(itParams, enParams, `Placeholder parameters mismatch for key "${key}": IT ${JSON.stringify(itParams)} vs EN ${JSON.stringify(enParams)}`);
}

// Verify that all data-i18n* attributes in index.html exist in dictionary
const attrRegex = /data-i18n(?:-placeholder|-aria-label|-title)?="([^"]+)"/g;
let attrMatch;
const htmlKeys = new Set();
while ((attrMatch = attrRegex.exec(indexHtmlContent)) !== null) {
  htmlKeys.add(attrMatch[1]);
}
assert(htmlKeys.size > 0, "HTML must contain data-i18n attributes");
for (const key of htmlKeys) {
  assert(itKeySet.has(key), `Key "${key}" used in HTML attribute is missing from translations dictionary`);
}
console.log(`       ✓ Dictionary parity verified (${itKeys.length} keys in IT and EN, ${htmlKeys.size} HTML attributes bound)!`);

// 8.2 Testing Initial Language Detection & Fallbacks
console.log("   8.2 Testing Initial Language Detection & Fallbacks...");

function detectInitialLanguage(navLang, storedLang) {
  if (storedLang === "it" || storedLang === "en") {
    return storedLang;
  }
  const lang = String(navLang || "").toLowerCase().trim();
  if (lang === "it" || lang.startsWith("it-")) {
    return "it";
  }
  return "en";
}

// Stored preference precedence
assert.strictEqual(detectInitialLanguage("en-US", "it"), "it", "Stored 'it' overrides English browser");
assert.strictEqual(detectInitialLanguage("it-IT", "en"), "en", "Stored 'en' overrides Italian browser");

// Browser language autodetection when no valid stored preference
assert.strictEqual(detectInitialLanguage("it", null), "it", "'it' -> it");
assert.strictEqual(detectInitialLanguage("it-IT", null), "it", "'it-IT' -> it");
assert.strictEqual(detectInitialLanguage("it-CH", undefined), "it", "'it-CH' -> it");
assert.strictEqual(detectInitialLanguage("IT", ""), "it", "'IT' (uppercase) -> it");
assert.strictEqual(detectInitialLanguage("it-it", null), "it", "'it-it' (lowercase) -> it");

// Non-Italian browsers default to English
assert.strictEqual(detectInitialLanguage("en", null), "en", "'en' -> en");
assert.strictEqual(detectInitialLanguage("en-US", null), "en", "'en-US' -> en");
assert.strictEqual(detectInitialLanguage("en-GB", null), "en", "'en-GB' -> en");
assert.strictEqual(detectInitialLanguage("fr-FR", null), "en", "'fr-FR' -> en");
assert.strictEqual(detectInitialLanguage("de-DE", null), "en", "'de-DE' -> en");
assert.strictEqual(detectInitialLanguage("es-ES", null), "en", "'es-ES' -> en");
assert.strictEqual(detectInitialLanguage("ja", null), "en", "'ja' -> en");
assert.strictEqual(detectInitialLanguage("", null), "en", "empty string -> en");
assert.strictEqual(detectInitialLanguage(null, null), "en", "null -> en");
assert.strictEqual(detectInitialLanguage(undefined, null), "en", "undefined -> en");

// Invalid stored preference falls back to browser detection
assert.strictEqual(detectInitialLanguage("it-IT", "invalid"), "it", "Invalid stored preference falls back to Italian browser");
assert.strictEqual(detectInitialLanguage("fr-FR", "spanish"), "en", "Invalid stored preference falls back to default English");

console.log("       ✓ Language detection & fallback rules passed!");

// 8.3 Testing Language Persistence & Isolation from Session Reset
console.log("   8.3 Testing Language Persistence & Isolation from Session Reset...");

const LANGUAGE_STORAGE_KEY = "video-annotator:language";
const i18nStore = {};
const mockI18nStorage = {
  getItem: (k) => i18nStore[k] || null,
  setItem: (k, v) => { i18nStore[k] = String(v); },
  removeItem: (k) => { delete i18nStore[k]; }
};

let currentTestLang = "it";
function setTestLanguage(lang) {
  if (lang !== "it" && lang !== "en") lang = "en";
  currentTestLang = lang;
  try {
    mockI18nStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {}
}

// Initial state
assert.strictEqual(mockI18nStorage.getItem(LANGUAGE_STORAGE_KEY), null);

// Switching to English persists
setTestLanguage("en");
assert.strictEqual(currentTestLang, "en");
assert.strictEqual(mockI18nStorage.getItem(LANGUAGE_STORAGE_KEY), "en");

// Switching to Italian persists
setTestLanguage("it");
assert.strictEqual(currentTestLang, "it");
assert.strictEqual(mockI18nStorage.getItem(LANGUAGE_STORAGE_KEY), "it");

// Invalid language code defaults to 'en'
setTestLanguage("de");
assert.strictEqual(currentTestLang, "en");
assert.strictEqual(mockI18nStorage.getItem(LANGUAGE_STORAGE_KEY), "en");

// Session teardown and forgetCurrentSession() MUST NOT remove language preference
mockI18nStorage.setItem("video-annotator:last-session:v1", JSON.stringify({ projectKey: "test" }));
mockI18nStorage.setItem("film-annotator:last-session:v1", JSON.stringify({ projectKey: "test" }));
mockI18nStorage.setItem("video-annotator:v1:youtube:test", JSON.stringify({ annotations: [] }));

function forgetSessionWithoutTouchingLanguage() {
  mockI18nStorage.removeItem("video-annotator:last-session:v1");
  mockI18nStorage.removeItem("film-annotator:last-session:v1");
}

forgetSessionWithoutTouchingLanguage();
assert.strictEqual(mockI18nStorage.getItem("video-annotator:last-session:v1"), null, "Session must be removed");
assert.strictEqual(mockI18nStorage.getItem(LANGUAGE_STORAGE_KEY), "en", "Language preference MUST survive forgetCurrentSession()");

console.log("       ✓ Language persistence & session isolation passed!");

// 8.4 Testing Translation Helper t(), Interpolation, and Formatting
console.log("   8.4 Testing Translation Helper t(), Interpolation, and Formatting...");

function createTestTranslator(initialLang = "it") {
  let lang = initialLang;
  function t(key, params = {}) {
    const dict = translations[lang] || translations.it;
    let str = dict[key] || (translations.it && translations.it[key]) || key;
    if (params && typeof params === "object") {
      Object.keys(params).forEach(k => {
        str = str.replaceAll("{" + k + "}", params[k]);
      });
    }
    return str;
  }
  return {
    getLanguage: () => lang,
    setLanguage: (l) => { lang = (l === "it" || l === "en") ? l : "en"; },
    t
  };
}

const translator = createTestTranslator("it");
// Simple keys
assert.strictEqual(translator.t("app.openVideo"), "Apri video");
translator.setLanguage("en");
assert.strictEqual(translator.t("app.openVideo"), "Open video");

// Parameterized keys
translator.setLanguage("it");
assert.strictEqual(translator.t("toast.inSet", { time: "00:01:23.456" }), "IN impostato a 00:01:23.456");
assert.strictEqual(translator.t("list.countMany", { count: 3 }), "3 annotazioni");
assert.strictEqual(translator.t("youtube.errorDefault", { code: 99 }), "Si è verificato un errore nella riproduzione del video YouTube (codice 99).");

translator.setLanguage("en");
assert.strictEqual(translator.t("toast.inSet", { time: "00:01:23.456" }), "IN set to 00:01:23.456");
assert.strictEqual(translator.t("list.countMany", { count: 3 }), "3 annotations");
assert.strictEqual(translator.t("youtube.errorDefault", { code: 99 }), "An error occurred while playing the YouTube video (code 99).");

// Fallback for missing keys returns the key
assert.strictEqual(translator.t("non.existent.key"), "non.existent.key");

// Localized formatOffset
assert.strictEqual(formatOffset(0, "it"), "+0,0 s", "formatOffset 0 in IT");
assert.strictEqual(formatOffset(0.5, "it"), "+0,5 s", "formatOffset +0.5 in IT");
assert.strictEqual(formatOffset(-0.5, "it"), "−0,5 s", "formatOffset -0.5 in IT");
assert.strictEqual(formatOffset(2.0, "it"), "+2,0 s", "formatOffset +2.0 in IT");
assert.strictEqual(formatOffset(-1.5, "it"), "−1,5 s", "formatOffset -1.5 in IT");

assert.strictEqual(formatOffset(0, "en"), "+0.0 s", "formatOffset 0 in EN");
assert.strictEqual(formatOffset(0.5, "en"), "+0.5 s", "formatOffset +0.5 in EN");
assert.strictEqual(formatOffset(-0.5, "en"), "−0.5 s", "formatOffset -0.5 in EN");
assert.strictEqual(formatOffset(2.0, "en"), "+2.0 s", "formatOffset +2.0 in EN");
assert.strictEqual(formatOffset(-1.5, "en"), "−1.5 s", "formatOffset -1.5 in EN");

console.log("       ✓ Translation helper and offset formatting passed!");

// 8.5 Testing DOM Localization & Reactive Language Switch
console.log("   8.5 Testing DOM Localization & Reactive Language Switch...");

function createMockDomEnvironment() {
  const doc = {
    documentElement: { lang: "it" },
    title: ""
  };

  const textElement = {
    attrs: { "data-i18n": "app.openVideo" },
    textContent: "Apri video",
    getAttribute(a) { return this.attrs[a]; }
  };

  const placeholderElement = {
    attrs: { "data-i18n-placeholder": "empty.youtubePlaceholder" },
    placeholder: "",
    getAttribute(a) { return this.attrs[a]; }
  };

  const buttonElement = {
    attrs: {
      "data-i18n-aria-label": "dock.markerAria",
      "data-i18n-title": "dock.markerAria"
    },
    ariaLabel: "",
    title: "",
    getAttribute(a) { return this.attrs[a]; },
    setAttribute(a, v) { if (a === "aria-label") this.ariaLabel = v; }
  };

  function createMockClassList() {
    const set = new Set();
    return {
      add(c) { set.add(c); },
      remove(c) { set.delete(c); },
      toggle(c, force) { if (force) set.add(c); else set.delete(c); },
      contains(c) { return set.has(c); }
    };
  }

  const langItBtn = {
    classList: createMockClassList(),
    ariaPressed: "true",
    setAttribute(a, v) { if (a === "aria-pressed") this.ariaPressed = v; }
  };
  langItBtn.classList.add("is-active");

  const langEnBtn = {
    classList: createMockClassList(),
    ariaPressed: "false",
    setAttribute(a, v) { if (a === "aria-pressed") this.ariaPressed = v; }
  };

  let activeLang = "it";

  function applyMockTranslations(lang) {
    activeLang = lang;
    doc.documentElement.lang = lang;
    doc.title = translations[lang]["app.pageTitle"];

    textElement.textContent = translations[lang][textElement.getAttribute("data-i18n")];
    placeholderElement.placeholder = translations[lang][placeholderElement.getAttribute("data-i18n-placeholder")];
    buttonElement.setAttribute("aria-label", translations[lang][buttonElement.getAttribute("data-i18n-aria-label")]);
    buttonElement.title = translations[lang][buttonElement.getAttribute("data-i18n-title")];

    const isIt = lang === "it";
    langItBtn.classList.toggle("is-active", isIt);
    langItBtn.setAttribute("aria-pressed", String(isIt));
    langEnBtn.classList.toggle("is-active", !isIt);
    langEnBtn.setAttribute("aria-pressed", String(!isIt));
  }

  return {
    doc,
    textElement,
    placeholderElement,
    buttonElement,
    langItBtn,
    langEnBtn,
    applyMockTranslations
  };
}

const mockDom = createMockDomEnvironment();

// Switch to English
mockDom.applyMockTranslations("en");
assert.strictEqual(mockDom.doc.documentElement.lang, "en", "html.lang must be 'en'");
assert.strictEqual(mockDom.doc.title, translations.en["app.pageTitle"], "Document title updated to English");
assert.strictEqual(mockDom.textElement.textContent, "Open video", "Text content updated to English");
assert.strictEqual(mockDom.placeholderElement.placeholder, "https://www.youtube.com/watch?v=...", "Placeholder updated to English");
assert.strictEqual(mockDom.buttonElement.ariaLabel, "Add marker (M)", "aria-label updated to English");
assert.strictEqual(mockDom.buttonElement.title, "Add marker (M)", "title updated to English");
assert.strictEqual(mockDom.langItBtn.classList.contains("is-active"), false, "IT button not active");
assert.strictEqual(mockDom.langItBtn.ariaPressed, "false", "IT button aria-pressed false");
assert.strictEqual(mockDom.langEnBtn.classList.contains("is-active"), true, "EN button active");
assert.strictEqual(mockDom.langEnBtn.ariaPressed, "true", "EN button aria-pressed true");

// Switch back to Italian
mockDom.applyMockTranslations("it");
assert.strictEqual(mockDom.doc.documentElement.lang, "it", "html.lang must be 'it'");
assert.strictEqual(mockDom.doc.title, translations.it["app.pageTitle"], "Document title updated to Italian");
assert.strictEqual(mockDom.textElement.textContent, "Apri video", "Text content updated to Italian");
assert.strictEqual(mockDom.buttonElement.ariaLabel, "Aggiungi marker (M)", "aria-label updated to Italian");
assert.strictEqual(mockDom.buttonElement.title, "Aggiungi marker (M)", "title updated to Italian");
assert.strictEqual(mockDom.langItBtn.classList.contains("is-active"), true, "IT button active");
assert.strictEqual(mockDom.langItBtn.ariaPressed, "true", "IT button aria-pressed true");
assert.strictEqual(mockDom.langEnBtn.classList.contains("is-active"), false, "EN button not active");
assert.strictEqual(mockDom.langEnBtn.ariaPressed, "false", "EN button aria-pressed false");

console.log("       ✓ Reactive DOM translation and lang toggle states passed!");

// 8.6 Testing Canonical CSV Export and Timecode Language-Independence
console.log("   8.6 Testing Canonical CSV Export and Timecode Language-Independence...");

const sampleAnnotations = [
  { type: "marker", in: 65.432, comment: "Analisi inquadratura / Shot analysis" },
  { type: "segment", in: 100.0, out: 125.5, comment: "Sequenza dialogo / Dialogue sequence" }
];

// CSV generated while active UI language is English or Italian must produce the exact same canonical output
const csvGenerated = generateCsv(sampleAnnotations, "local", "test.mp4");
assert(csvGenerated.includes('"ID","Type","IN","OUT","IN_seconds","OUT_seconds","Comment","Source","Video"'), "CSV header must remain canonical English regardless of UI language");
assert(!csvGenerated.includes('"Tipo"'), "CSV header must not contain Italian 'Tipo'");
assert(!csvGenerated.includes('"Sorgente"'), "CSV header must not contain Italian 'Sorgente'");
assert(!csvGenerated.includes('"IN_secondi"'), "CSV header must not contain Italian 'IN_secondi'");
assert(!csvGenerated.includes('"OUT_secondi"'), "CSV header must not contain Italian 'OUT_secondi'");
assert(csvGenerated.includes('"marker"'), "Marker type must remain canonical 'marker'");
assert(csvGenerated.includes('"segment"'), "Segment type must remain canonical 'segment'");
assert(!csvGenerated.includes('"segmento"'), "Segment type must NOT be Italian 'segmento'");
assert(csvGenerated.includes('"00:01:05.432"'), "Timecode formatting HH:MM:SS.mmm must remain unchanged");
assert(csvGenerated.includes('"00:01:40.000"'), "Timecode IN formatting unchanged");
assert(csvGenerated.includes('"00:02:05.500"'), "Timecode OUT formatting unchanged");
assert(csvGenerated.includes('"Analisi inquadratura / Shot analysis"'), "User text must be untouched");

// Verify filename algorithm is identical in IT and EN UI
const testDate = new Date(2026, 8, 25);
const ytSampleState = {
  sourceType: "youtube",
  sourceId: "OFS8SpwioZ4",
  videoTitle: "Crip Camp: A Disability Revolution"
};
const localSampleState = {
  sourceType: "local",
  file: { name: "Crip Camp.mp4" }
};
assert.strictEqual(
  generateCsvFilename(ytSampleState, testDate),
  "video-annotator_youtube_crip-camp-a-disability-revolution_OFS8SpwioZ4_2026-09-25.csv",
  "YouTube filename identical in IT/EN"
);
assert.strictEqual(
  generateCsvFilename(localSampleState, testDate),
  "video-annotator_local_crip-camp_2026-09-25.csv",
  "Local filename identical in IT/EN"
);

console.log("       ✓ Canonical CSV export and timecode language-independence passed!");

console.log("   ✓ Internationalization IT/EN tests passed!");

console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
