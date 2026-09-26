# video-annotator

[Italiano](README.it.md)

**video-annotator** is an open-source, browser-based tool for time-coded video annotation, designed for research, education, and film and media analysis.

It supports browser-compatible local video files and YouTube videos, allowing users to create point markers and IN–OUT segments, attach comments to specific moments or intervals, work with external subtitles, navigate annotations through an interactive timeline, and export structured annotation data as CSV.

* **Live Demo:** [https://bonavolonta.github.io/video-annotator/](https://bonavolonta.github.io/video-annotator/)
* **Version:** 1.4.0
* **License:** MIT

---

## Overview

video-annotator provides a focused environment for manually annotating audiovisual material directly in the browser.

The application is designed around a small set of core operations: identifying a relevant moment in a video, marking a single time point or a temporal interval, adding a textual comment, returning to annotated moments, and exporting the resulting annotations in a structured format.

The aim is not to reproduce the extensive feature sets of specialised multimodal annotation or qualitative data analysis platforms. Instead, video-annotator provides a comparatively simple environment for teaching, research, observation, and analytical activities in which time-coded video annotation is required without a complex software workflow.

---

## Project origins

video-annotator originated within a research activity at the University of Cagliari, in the context of the Special Education course taught by Prof. Antonello Mura and the broader activities of the research group coordinated by Prof. Mura.

The tool emerged from the need to provide students with a simple and accessible environment for video annotation in educational and research activities. Its design therefore concentrates on a limited set of core annotation functions while avoiding the complexity of more specialised audiovisual annotation environments.

The project is situated within a broader collaborative research context in which the tool can support experimentation, evaluation, discussion, and methodological reflection on the use of video annotation in teaching and research.

Although initially developed in an academic teaching context, video-annotator is intended as a general-purpose tool that can also support research, qualitative video analysis, and film and media analysis.

---

## Intended uses

### Research

video-annotator can support research workflows in which audiovisual material needs to be inspected, segmented, commented on, and revisited at specific time points.

Possible uses include observational research, qualitative video analysis, identification of analytically relevant episodes, preliminary coding activities, and the construction of structured datasets containing temporal references and researcher-generated comments.

video-annotator is not intended to replace full-featured qualitative data analysis or multimodal annotation environments. It can instead be used as a focused component within broader research workflows.

### Education

The tool can be used in educational contexts where students or educators need to connect observations and comments to specific moments in audiovisual material.

Potential applications include video-based learning, classroom observation, reflective activities, teacher education, analysis of educational situations, guided discussion of video material, and other learning activities based on close examination of audiovisual evidence.

### Film and media analysis

video-annotator can support the identification and annotation of scenes, sequences, transitions, events, or other temporally defined elements in film and media materials.

Its marker and IN–OUT annotation model makes it possible to distinguish between observations associated with a single point in time and observations referring to an extended audiovisual segment.

---

## Features

* Browser-based operation
* Local video playback
* YouTube playback through the official YouTube IFrame Player API
* Time-coded point markers
* IN–OUT temporal segments
* Textual comments
* Interactive annotation timeline
* Direct seek to annotated moments and segments
* Annotation editing and deletion
* Annotation drawer
* Local session persistence and restoration
* Session reset through *Forget this session*
* External SRT subtitles
* External WebVTT subtitles
* Separate subtitle rail
* Subtitle ON/OFF control
* Adjustable subtitle text size
* Subtitle synchronization offset in ±0.5 second steps
* Canonical CSV annotation export
* Italian and English user interface
* Persistent language preference
* Keyboard shortcuts
* Fullscreen mode
* Keyboard and screen-reader accessibility support

---

## Annotation model

video-annotator uses two primary annotation types.

### Marker

A marker represents an annotation anchored to a single point in the video timeline.

It associates a time position with an optional textual comment and can subsequently be selected to return to the corresponding moment in the video.

Markers are useful when the analytical object is an event or observation associated with a specific instant.

### IN–OUT segment

A segment represents an annotation associated with a temporal interval.

The user first defines an IN point and then an OUT point. A textual comment can then be associated with the resulting interval.

Segments are useful when the analytical object extends over time, such as an interaction, sequence, scene, action, discourse episode, or other temporally bounded unit.

Both annotation types are represented in the canonical CSV export together with information identifying their video source.

---

## Video sources

### Local video

Users can select a browser-supported video file available on their own device.

The selected file is handled client-side by the browser and is not uploaded to a video-annotator server.

Because video-annotator has no application backend, it does not maintain a remote copy of local audiovisual material.

Actual format and codec support depend on the user's browser and operating system.

### YouTube

Users can load a YouTube video by providing a supported YouTube URL.

Playback is handled through the official YouTube IFrame Player API. video-annotator controls operations such as playback position and seeking while the audiovisual content remains within the YouTube player.

video-annotator does not download or redistribute YouTube video content.

YouTube functionality depends on the availability and behaviour of the external YouTube service and should be used through an HTTP/HTTPS deployment such as the public GitHub Pages version.

---

## Subtitles

video-annotator supports external subtitle files in:
* SRT (`.srt`)
* WebVTT (`.vtt`)

Imported subtitles are displayed in a dedicated subtitle rail separated from the video image.

Users can:
* turn subtitle display on or off;
* decrease, reset, or increase subtitle text size;
* adjust subtitle timing in ±0.5 second increments;
* remove the currently loaded subtitle track.

Subtitle state and preferences can be retained as part of the local session.

SRT and WebVTT files are input resources. Annotation data are exported separately through the canonical CSV format described below.

---

## Data export

Annotations can be exported as a canonical CSV file.

The export schema is independent of the selected interface language so that data generated using either the Italian or English interface remain structurally identical.

### Canonical schema

```csv
ID,Type,IN,OUT,IN_seconds,OUT_seconds,Comment,Source,Video
```

### Fields

| Field | Description |
| :--- | :--- |
| `ID` | Unique annotation identifier |
| `Type` | Annotation type: `marker` or `segment` |
| `IN` | Human-readable IN timestamp |
| `OUT` | Human-readable OUT timestamp; empty for markers |
| `IN_seconds` | IN position expressed in seconds |
| `OUT_seconds` | OUT position expressed in seconds; empty for markers |
| `Comment` | User-provided annotation text |
| `Source` | Video source: `local` or `youtube` |
| `Video` | Information identifying the video associated with the annotation |

CSV files are generated using:
* UTF-8 with BOM;
* comma as field separator;
* RFC 4180-compatible quoting and row structure.

The numerical time fields facilitate subsequent processing in spreadsheets, statistical environments, programming languages, and other research workflows.

---

## Technical architecture

video-annotator is a static web application implemented with:
* HTML;
* CSS;
* Vanilla JavaScript.

It has no application backend, database, account system, framework dependency, or runtime package dependency.

A common MediaAdapter abstraction provides a unified interface for operations such as current time, duration, playback, pause, and seeking across local HTML5 video and YouTube sources.

Annotations, session state, language preference, and related application data are persisted locally in the browser.

No application build step is required for normal use. The project can therefore be deployed on a static hosting service such as GitHub Pages.

---

## Data and privacy

video-annotator follows a local-first approach for application data.

The application has no remote annotation database, user account system, or server-side session storage.

For local-video workflows:
* video files are selected from the user's device;
* external subtitle files are read client-side;
* annotations are created client-side;
* session data are stored locally in the browser;
* CSV export is generated client-side.

video-annotator does not upload these resources to its own server.

When YouTube is used, video playback necessarily relies on YouTube's external infrastructure and services. Users should therefore distinguish between data processed locally by video-annotator and interactions involving the externally hosted YouTube player.

---

## Copyright and content responsibility

video-annotator does not provide, host, download, or redistribute audiovisual content.

Local video files and subtitle files are selected by the user and processed client-side, while YouTube videos are played through the official YouTube IFrame Player API.

Users are responsible for ensuring that they have the necessary rights or another lawful basis to use, annotate, reproduce, or share the audiovisual and subtitle materials they select.

Educational or research use does not in itself remove applicable copyright restrictions.

---

## Accessibility

Accessibility has been treated as a core design requirement throughout the development of video-annotator.

Version 1.4.0 was tested against WCAG 2.2 Level A/AA, with additional reference to ISO/IEC 40500:2025, EN 301 549 V4.1.1, WAI-ARIA 1.2, and relevant WAI-ARIA Authoring Practices guidance.

Accessibility work included, among other aspects:
* keyboard navigation;
* visible keyboard focus;
* focus management and restoration;
* accessible names;
* dialog and panel interaction;
* annotation timeline semantics;
* YouTube iframe naming;
* subtitle status announcements;
* tab/tabpanel semantics;
* non-text contrast;
* mitigation of single-character shortcut conflicts.

### Test scope

Testing for version 1.4.0 included:
* the complete automated regression suite, with 9/9 top-level test groups passing;
* axe testing across 10 representative application states, with 0 detected WCAG A/AA violations;
* manual screen-reader testing using VoiceOver with Safari on macOS;
* manual verification performed on 26 September 2026.

These results describe the tested version, states, and environment. They should not be interpreted as a claim of universal or absolute accessibility across every browser, assistive technology, media source, or user configuration.

### Known accessibility limitation

For YouTube subtitle synchronization, the subtitle update interval has been reduced to 50 ms to improve temporal responsiveness.

However, an instrumented end-to-end measurement against the actual audiovisual clock across at least 20 subtitle cues has not been completed. Accordingly, no claim is made that the relevant timing requirement in EN 301 549 §7.1.2 has been fully verified for YouTube subtitle synchronization.

---

## Keyboard shortcuts

Character-based application shortcuts require the Alt modifier in order to reduce conflicts with text entry and common browser interaction.

| Shortcut | Action |
| :--- | :--- |
| <kbd>Alt</kbd>+<kbd>M</kbd> | Add a marker |
| <kbd>Alt</kbd>+<kbd>I</kbd> | Set the IN point |
| <kbd>Alt</kbd>+<kbd>O</kbd> | Set the OUT point |
| <kbd>Alt</kbd>+<kbd>A</kbd> | Open annotations |
| <kbd>Alt</kbd>+<kbd>C</kbd> | Open subtitles |
| <kbd>Alt</kbd>+<kbd>F</kbd> | Toggle fullscreen |

Standard keyboard interaction, including Tab, Shift+Tab, Enter, Space, and Escape, is supported where appropriate for the active interface component.

---

## Interface languages

The interface is available in:
* Italian
* English

Users can switch language without reloading the page.

The application also:
* detects the browser language on first use;
* remembers the selected language;
* updates the document language (`<html lang="...">`);
* localises interface labels, placeholders, messages, errors, titles, and accessible names.

User-generated annotation content is never automatically translated.

The canonical CSV schema is also independent of the interface language.

---

## Running video-annotator

### Online

The public application is available through GitHub Pages:  
[https://bonavolonta.github.io/video-annotator/](https://bonavolonta.github.io/video-annotator/)

No installation is required for normal use of the hosted version.

### Local use

The repository can be cloned or downloaded and served as a static web application.

No application build step or package installation is required.

For example, if Python 3 is available, a local HTTP server can be started from the repository directory with:

```bash
python3 -m http.server 8000
```

The application can then be opened through the corresponding localhost address.

Serving the application over HTTP/HTTPS is recommended and is particularly important for YouTube integration because the YouTube player relies on normal web-origin and referrer behaviour.

---

## Testing

The repository includes an automated regression suite that can be executed with:

```bash
npm test
```

The test suite covers nine major areas:
1. YouTube URL parsing;
2. the common MediaAdapter;
3. multi-source storage and session isolation;
4. YouTube error-code handling;
5. canonical CSV formatting and filename generation;
6. media teardown and session-reset semantics;
7. SRT/WebVTT subtitle handling;
8. Italian/English internationalisation;
9. accessibility-related regressions.

The test suite uses Node.js standard modules and does not require application runtime dependencies.

Automated tests complement, rather than replace, manual browser and assistive-technology testing.

---

## Research context

Time-aligned audiovisual annotation has an established role in multimodal research, interaction analysis, qualitative video research, education, and media-oriented analysis.

Early annotation environments such as ANVIL introduced flexible models based on time-anchored elements distributed across multiple annotation tracks, while ELAN developed a framework with particular attention to accurate temporal alignment in multimodality research [1, 2].

More broadly, systematic examination of recorded interaction has long been used in qualitative and interactional research. Jordan and Henderson described interaction analysis as an empirical approach based on repeated examination of audiovisual records, providing an important methodological context for analytical work with recorded events [3].

In educational research and teacher education, video annotation has been investigated as a means of connecting observations and reflective comments to specific audiovisual evidence. Rich and Hannafin examined video annotation technologies as tools for structuring and supporting teacher reflection [4]. A subsequent systematic literature review by von Wachter and Lewalter identified recurrent uses of video annotation in teacher education, including documentation, communication, feedback, and reflective activity [6].

Digital annotation has also been applied in film and media studies. VIAN, for example, is a specialised visual annotation environment developed for systematic film analysis, illustrating the broader relevance of digital annotation systems for the examination of audiovisual artefacts [5].

video-annotator does not attempt to reproduce the multilayer annotation models, specialist analytical functions, or corpus-management capabilities of these established systems. It adopts a deliberately narrower model based on point markers and IN–OUT segments in order to provide a comparatively simple browser-based environment for common time-coded annotation tasks.

### Selected references

1. Kipp, M. (2001). ANVIL – A Generic Annotation Tool for Multimodal Dialogue. *Proceedings of the 7th European Conference on Speech Communication and Technology (Eurospeech 2001)*, 1367–1370. doi:10.21437/Eurospeech.2001-354.
2. Wittenburg, P., Brugman, H., Russel, A., Klassmann, A., & Sloetjes, H. (2006). ELAN: a Professional Framework for Multimodality Research. *Proceedings of the Fifth International Conference on Language Resources and Evaluation (LREC 2006)*. European Language Resources Association.
3. Jordan, B., & Henderson, A. (1995). Interaction Analysis: Foundations and Practice. *The Journal of the Learning Sciences*, 4(1), 39–103. doi:10.1207/s15327809jls0401_2.
4. Rich, P. J., & Hannafin, M. (2009). Video Annotation Tools: Technologies to Scaffold, Structure, and Transform Teacher Reflection. *Journal of Teacher Education*, 60(1), 52–67. doi:10.1177/0022487108328486.
5. Halter, G., Ballester-Ripoll, R., Flueckiger, B., & Pajarola, R. (2019). VIAN: A Visual Annotation Tool for Film Analysis. *Computer Graphics Forum*, 38(3), 119–129. doi:10.1111/cgf.13676.
6. von Wachter, J.-K., & Lewalter, D. (2023). Video Annotation as a Supporting Tool for Video-based Learning in Teacher Training – A Systematic Literature Review. *International Journal of Higher Education*, 12(2), 1–19. doi:10.5430/ijhe.v12n2p1.

---

## Limitations and scope

video-annotator is intentionally focused on a limited set of time-coded annotation tasks.

It currently does not provide:
* automated video interpretation or computer vision;
* automatic annotation generation;
* hierarchical or multilayer annotation schemes comparable to specialised multimodal annotation platforms;
* a general-purpose qualitative coding system;
* corpus-level search or analysis;
* real-time multi-user collaboration;
* a remote annotation database;
* user accounts or cloud synchronisation.

Annotations and session data stored in the browser are subject to the normal persistence and storage limitations of browser-local storage. Clearing browser data or changing browser/device may therefore make locally stored session information unavailable unless annotation data have been exported.

YouTube playback depends on an external service and may be affected by video availability, embedding restrictions, network conditions, browser policies, or changes to the YouTube platform.

The accessibility testing described above applies to the documented test scope and should not be interpreted as a guarantee of identical behaviour in every possible environment.

---

## Citation

Citation metadata for video-annotator 1.4.0 are provided in [CITATION.cff](CITATION.cff).

When using video-annotator in academic work, please cite the software version used so that the software associated with the research workflow can be identified as precisely as possible.

Information about a persistent DOI will be added if software archiving through a DOI-providing repository is adopted.

---

## License

video-annotator is released under the MIT License.

See [LICENSE](LICENSE) for the complete license text.

Copyright © 2026 Gianmarco Bonavolonta.

---

## Acknowledgements

video-annotator originated in the academic environment of the University of Cagliari, within a research activity connected to the Special Education course taught by Prof. Antonello Mura and to the broader work of the research group coordinated by Prof. Mura.

This context provided the educational and research setting in which the need for the tool was identified and in which its uses can continue to be explored and evaluated.

---

## Author

Gianmarco Bonavolonta  
Repository: [https://github.com/bonavolonta/video-annotator](https://github.com/bonavolonta/video-annotator)

---

## Version

This documentation refers to video-annotator 1.4.0.
