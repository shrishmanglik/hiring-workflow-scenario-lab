# Verification evidence

Date: 2026-08-01 (America/Toronto)

## Deterministic suites

| Command | Result |
|---|---|
| `npm.cmd run test:focused` | PASS — 4 files, 51 tests |
| `npm.cmd run test:accessibility` | PASS — 1 file, 5 tests |
| `npm.cmd run test:security` | PASS — 1 file, 5 tests |
| `npm.cmd run test:recovery` | PASS — 1 file, 5 tests |
| `npm.cmd run test:mutation` | PASS — 2 files, 13 tests |
| `npm.cmd test` | PASS — 10 files, 85 tests |
| `npm.cmd run typecheck` | PASS — exit 0 |
| `npm.cmd run lint` | PASS — exit 0, zero warnings allowed |
| `npm.cmd run build` | PASS — Next.js 16.2.12 production build; `/` static, API routes dynamic, `icon.svg` static |

## Negative-before and mutation proof

- The initial `CV-R1` test exited `1` before the acceptance module existed; the same test passed after implementation.
- With `DISABLE_DETECTOR=DET-CV-R7`, the critical overlap control exited `1`: expected `REJECT`, received `PASS`.
- With the detector restored, the identical critical command passed twice consecutively.
- The mutation meta-suite disabled each of the twelve named detectors and proved its paired bad fixture would falsely pass.

## Real-browser journey

Local compiled app: `http://127.0.0.1:3100` (not deployed).

- Known-good: `PASS`; all twelve controls passed; packet marked ready for distinct human review.
- Known-bad scheduling: `CV-R7` rejected; run `BLOCKED`; final packet step held for repair.
- Detector/source failure: `INDETERMINATE`; banner states `EVIDENCE INDETERMINATE`; no clean claim emitted.
- Restore: selected failure state cleared and known-good fixture returned.
- Desktop: 1440 × 1000 full-page rendered screenshot visually inspected.
- Mobile: 390 × 844 full-page rendered screenshot visually inspected; `scrollWidth=390`, `innerWidth=390`.
- Browser console: 0 errors, 0 warnings after the favicon repair.

Artifacts:

- `docs/screenshots/scenario-lab-desktop.png`
- `docs/screenshots/scenario-lab-mobile.png`

## Claim ceiling

This is local implementation and browser evidence. Hosted CI, GitHub PR state, deployment, provider state, live RLS, customer use, commercial demand, calibration, and revenue require their own evidence classes.
