# Failing-before evidence

## Control

Command:

```powershell
npm.cmd test -- --run tests/acceptance/source-snapshot.test.ts
```

Before the detector existed, the command exited `1`. Vitest reported one failed suite and the exact load-bearing failure:

```text
Cannot find package '@/domain/acceptance'
Test Files  1 failed (1)
Tests       no tests
```

This proves the acceptance test was not green through an adjacent stub or absent dependency.

After `src/domain/acceptance.ts` was implemented, the same command exited `0` with `1 passed (1)`.

## Critical detector mutation

Command:

```powershell
$env:DISABLE_DETECTOR='DET-CV-R7'
npm.cmd run control:critical
```

The command exited `1` because the seeded scheduling overlap falsely returned `PASS` when the named detector was disabled. With the environment variable removed, the same control passed twice in succession.
