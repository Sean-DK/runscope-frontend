# Handoff: RunScope — Race Tracker UI

## Overview
RunScope is a mobile-first PWA that lets runners broadcast their race progress in real time and lets spectators follow along with a 6-digit code. This package specifies the full UI: a dark-first design system plus 12 key screens (home, routes, route builder, live host, three spectator variations, join, and past-event views).

## About the Design Files
The file in this bundle (`RunScope.dc.html`) is a **design reference created in HTML** — a prototype showing the intended look, layout, and behavior. It is **not production code to copy directly**. The task is to **recreate these designs in the existing codebase** (React + TypeScript, inline React styles, `react-map-gl`/Mapbox) using its established patterns and components.

> The HTML uses styled `<div>` blocks as stand-in maps. In the real app, **every map area must be a real `react-map-gl` `<Map>`** — see "Maps" below. The route polylines, runner markers, and start/finish markers in the mock indicate exactly what to render on top of the live map.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions. Recreate the UI pixel-perfectly using the codebase's libraries and patterns. Exact hex values, font sizes, and measurements are given below and are authoritative.

---

## Design Tokens

### Color
| Token | Hex | Usage |
|---|---|---|
| `base` | `#0A0B0D` | App background (screen) |
| `surface` | `#14161A` | Cards, inputs, list rows |
| `elevated` | `#1C1F25` | Raised chips, keypad keys, avatars |
| `mapBase` | `#0C0E12` | Map canvas background |
| `volt` | `#C8F94E` | Primary / live / go / runner dot / CTAs |
| `amber` | `#FFB627` | Paused state |
| `red` | `#FF5247` | End / stop / destructive |
| `textPrimary` | `#F2F4F7` | Headlines, values |
| `textSecondary` | `#98A0AC` | Labels, supporting copy |
| `textTertiary` | `#5C636E` | Captions, eyebrows, disabled |
| `hairline` | `rgba(255,255,255,0.08)` | Card borders / dividers |
| `voltSoft` | `rgba(200,249,78,0.12–0.16)` | Live badge / accent fills |

Volt is used on dark text (`#0A0B0D`) when filled (buttons, badges). Never put volt text on volt fill.

### Typography
- **Display & numerals** — `Space Grotesk` (500/700), `font-variant-numeric: tabular-nums` for all timers/clocks. Used for headlines, stat values, big timers, event code area.
- **UI & body** — `Manrope` (400/500/600/700). Default for labels, body, buttons-with-words, nav.
- **Codes** — `Space Mono` (400/700). Event codes (`74K291`, letter-spacing `.22em`), code-entry boxes, split distances.

Type scale (px): hero timer 68 · finish time 50 · pace hero 74 · screen title 26–28 · stat value 24–30 · section label 11 (uppercase, letter-spacing `.12–.14em`, tertiary) · body 14–15 · caption 11–13.

### Spacing & shape
- 4px base grid: 4 / 8 / 12 / 16 / 20 / 24 / 32.
- Screen horizontal padding: 22–24px.
- Radius: buttons 14–18 · cards 16–22 · pills/badges 100px · phone screen 42 · FAB 16.
- Card pattern: `background:#14161A; border:1px solid rgba(255,255,255,.08); border-radius:18px`.

### Motion
- `rsPulse` (2s, ease-out, infinite) — runner marker halo: scale 1→2.8, opacity .5→0.
- `rsBlink` (1.1–1.4s, infinite) — LIVE dots and text-input carets.

### Iconography
All icons are simple inline stroke SVGs (`stroke-width` 1.8–2.4, round caps), no icon library — matches the "no external icon libraries" constraint. Keep them as small inline components.

---

## Maps (critical)
Every screen with a map must use `react-map-gl` with a dark, desaturated Mapbox style (e.g. `mapbox://styles/mapbox/dark-v11`, optionally desaturated further). Render on top of the live map:
- **Route** — a `Source`/`Layer` line. Two stacked line layers: a wide translucent glow (`#C8F94E` @ ~0.18, width ~13) under a crisp line (`#C8F94E`, width ~4.5), round joins/caps.
- **Start marker** — filled `#0A0B0D` circle, 3px `#F2F4F7` ring.
- **Finish marker** — small rounded square; `#F2F4F7` for in-progress, `#C8F94E` for completed events.
- **Runner marker** — `#C8F94E` dot (18px) with dark border + volt outer ring, plus an animated pulse halo (`rsPulse`). Position from live coordinates.
- **Map control overlays** (back, share, locate, undo) — floating 38–44px buttons, `rgba(10,11,13,.7)` + `backdrop-filter: blur(8px)` + hairline border.

Screens with maps: Route detail (top, 300px), Route builder (full-screen), Spectator A (top 420px), Spectator B (full-bleed), Spectator C (104px strip), Past-event detail (top 268px).

---

## Screens / Views

### 1. Home — Signed out
- **Purpose:** First-run choice between runner and spectator.
- **Layout:** Column, 24px padding. App bar (logo + name left, `?` help circle right) → hero (LIVE pill, 36px headline "Share every mile, the moment it happens.", secondary line) → pushed to bottom: two choice cards → "Sign in" link.
- **Choice cards:** Card 1 volt fill / dark text "I'm running" (eyebrow "For runners", subtitle, circular arrow). Card 2 surface "I'm spectating" with volt arrow. Radius 22, padding 22.
- **Logo:** 30px volt ring with a centered 7px volt dot + two tick marks (a "scope" reticle).

### 2. Home — Signed in
- **Purpose:** Logged-in hub.
- **Layout:** Header ("Good morning" / "Sam Rivera" 26px + 44px "SR" avatar) → volt "Start a race" CTA (play icon) → 2-col grid: "My routes" (12) & "Past events" (28) stat cards (128px tall, icon top, big number bottom) → wide "Join an event" row → "Recent route" mini row with 48px route thumbnail → bottom tab bar.
- **Tab bar:** 80px, top hairline, bg `#0C0D10`. 5 items: Home, Routes, center volt FAB (+, raised -10px, glow shadow), Events, You. Active = volt; inactive = tertiary. Icon + 10px label.

### 3. Join event
- **Purpose:** Enter a 6-digit code.
- **Layout:** Back row → centered locate-icon badge → "Enter event code" + instructions → 6 code boxes (44×56, mono 24px; filled show char, active box has volt border + blinking caret, empty are surface) → pushed down: phone-style keypad (3×4 grid, numbers with ABC subscripts, "Paste", 0, backspace icon) → disabled "Join event" button (becomes volt when 6 chars entered).

### 4. Route list
- **Purpose:** Browse saved routes.
- **Layout:** Title "My routes" (28px) + volt `+` button → search pill → list rows → tab bar.
- **Row:** 50px route thumbnail (mini volt polyline on `#0C0E12`) + name + "10.2 km · 142 m gain" + right-aligned date. Bottom hairline between rows.

### 5. Route detail
- **Purpose:** Review a route, then start a race.
- **Layout:** Top map (300px, full route, floating back + share buttons) → name + "Mixed surface · Moderate" + star button → 3-cell stat strip (10.2 KM / 142 M GAIN / 58 EST MIN, dividers between) → "Elevation" mini area chart (64px) → bottom: volt "Start race" (play) + row of "Edit route" / "Share link" secondary buttons.

### 6. Route builder
- **Purpose:** Draw a route on a map with a slide-in drawer.
- **Layout:** Full-screen map with numbered waypoint pins (1,2,3) and a dashed segment to the next point + a volt cursor dot. Floating top: back button + name field ("New route" with blinking caret). Floating right: locate + undo buttons. **Left drawer** (~280px, `rgba(10,11,13,.94)` + blur, right border + shadow) over the map: "Building route" + close → distance card ("6.8 km", "≈ 39 min · 3 waypoints") → waypoint list (Start, Bridge crossing, Turnaround, + Add point) with connectors → "Out & back" (on) / "Avoid hills" (off) toggles → volt "Save route".
- **Toggle:** 44×26 pill; on = volt track + dark knob, off = `#2A2E36` track + light knob.

### 7. Event host — Live (minimal)
- **Purpose:** The runner's glanceable live screen.
- **Layout:** Centered column. LIVE badge (blinking dot) → route name → **huge 68px elapsed timer "42:17"** + "ELAPSED" label → event-code card (label, 40px mono volt "74K291", "8 spectators watching") → 2 small stat cards (7.4 KM SO FAR / 5:42 PACE) → bottom: "Pause" (amber outline) + "End race" (red fill) + "Cancel event" text link.

### 8. Spectator A — Split view (canonical)
- **Purpose:** Balanced map + stats.
- **Layout:** Top half = map (420px) with floating runner-name pill (avatar + name) and LIVE badge, plus a bottom overlay card ("2.4 km to finish", 68%, progress bar). Bottom half = 2×2 stat grid (Distance, Avg pace, Elapsed, Est. finish — the last in a volt-bordered card with volt value) → "Updated 2s ago · auto-refresh" footer.

### 9. Spectator B — Map-forward (variation)
- **Purpose:** Immersive, map-dominant.
- **Layout:** Full-bleed map + runner. Floating top: name pill with inline LIVE + close `×`. **Bottom sheet** (blurred, rounded top, drag handle): "Distance to finish" + "ETA 11:48 AM" → 46px "2.4 km to go" → progress bar with "7.4 km done / 10.2 km total" → 3 stat tiles (Pace / Elapsed / BPM) → volt "Send a cheer".

### 10. Spectator C — Scoreboard (variation)
- **Purpose:** Data-first, glance metrics.
- **Layout:** Header (name + LIVE) → **volt hero panel** with "CURRENT PACE" + 74px "5:42 /km" + "12s faster than goal pace" → 2 stat cards (Distance / Elapsed) → 104px map strip with runner → "Splits" list (5k/6k/7k with pace bars; next split dimmed).

### 11. Past events
- **Purpose:** History list.
- **Layout:** Title → 2 summary cards (28 Races / 412 km Broadcast) → month-grouped rows ("April 2026", "March 2026"). Row: name (+ optional volt "PR" tag) + "Apr 14 · 21.1 km" left, finish time + pace right → tab bar (Events active).

### 12. Past event detail
- **Purpose:** Completed-race recap.
- **Layout:** Top map (268px, full route, volt finish marker) → name + "PR" tag + "April 14, 2026 · 14 spectators" → finish-time card (50px "1:52:30" + "Personal best by 1:14") → 3 stat cells (21.1 KM / 5:19 PACE / 186 M GAIN) → "Splits" list (5k/10k/15k/20k with bars) → volt "Share recap".

---

## Interactions & Behavior
- **Navigation:** Choice cards → respective flows. Tab bar switches Home/Routes/Events/You; center FAB → start-race / new-route entry. Back buttons pop.
- **Join:** Keypad fills code boxes left→right; active box shows blinking caret; at 6 chars the "Join event" button enables (volt) and submits/validates the code.
- **Route builder:** Tapping the map adds waypoints (numbered pins + connecting line); drawer distance/time recompute live; undo removes last point; "Out & back" mirrors the route; Save persists.
- **Host:** Timer counts up (tabular nums, no layout shift); spectator count updates live; Pause→amber/resume, End→confirm then summary, Cancel→discard.
- **Spectator (all):** Runner marker + stats update from a live feed (poll or socket); progress bar = distance/total; "auto-refresh" / "Updated Ns ago" reflects last update; B/C add cheer + ETA. Pulse halo animates continuously.
- **Animations:** `rsPulse` runner halo; `rsBlink` LIVE dots & carets. Keep transitions subtle; this is used outdoors mid-race.

## State Management
- **Auth:** signed-in vs signed-out (switches Home variant).
- **Routes:** list, selected route (geometry, distance, elevation, surface, difficulty), builder draft (waypoints[], outAndBack, avoidHills, computed distance/time).
- **Live event (host):** eventId, code, status (`live`|`paused`|`ended`), startedAt → elapsed, runner position, distance, pace, spectatorCount.
- **Spectator session:** joined code, live runner telemetry (position, distance, pace, elapsed, hr, progress, ETA), lastUpdated.
- **Past events:** list (grouped by month) + detail (finish time, splits[], stats, spectatorCount, isPR).
- **Data:** real-time telemetry via WebSocket or short polling; map coords feed `react-map-gl` markers/sources.

## Assets
- **Fonts:** Google Fonts — Space Grotesk, Manrope, Space Mono (weights noted above).
- **Icons:** inline SVGs defined in the HTML — reuse as small React icon components; no icon dependency.
- **Maps:** Mapbox via `react-map-gl` (needs a Mapbox token). No other image assets; route thumbnails are generated SVG polylines.
- **Logo:** CSS/SVG "scope reticle" mark — reproduce as a small component.

## Files
- `RunScope.dc.html` — the full design reference (design-system frame + all 12 screens) on a pannable canvas. Open in a browser to inspect exact markup, inline styles, and SVG icon paths for any element.
