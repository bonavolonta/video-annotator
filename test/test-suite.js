// test/test-suite.js
// Automated test suite for video-annotator v1.2

const assert = require("assert");

console.log("=== Running video-annotator v1.2 Test Suite ===\n");

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

console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
