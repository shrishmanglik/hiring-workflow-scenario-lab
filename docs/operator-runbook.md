# Operator runbook

## Start

```powershell
npm.cmd ci --no-audit --no-fund
npm.cmd run dev
```

Open `http://localhost:3000`. Confirm the UI says `Synthetic fixture` and `Read-only`. Confirm `GET /api/health` returns `status: ok`, `mode: synthetic-read-only`, and `productionMutationCapability: false`.

## Known-good journey

1. Leave every failure switch off.
2. Select **Run deterministic proof**.
3. Confirm all twelve controls pass.
4. Confirm the trace ends at `Human review packet prepared`.
5. Confirm the receipt states zero source writes and the closeout says distinct human review is next.

## Known-bad journey

1. Enable **Overlapping panel**.
2. Run the proof.
3. Confirm the decision is `BLOCKED` and `CV-R7` rejects.
4. Confirm the approval packet is blocked.
5. Select **Restore accepted** and rerun. Confirm the known-good receipt returns.

## Indeterminate journey

Enable **Broken detector feed**. Confirm the run says `INDETERMINATE`, exposes incomplete source/unhealthy detector evidence, and does not emit a clean claim.

## Local release proof

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Do not deploy, connect a provider, add credentials, import real data, or claim commercial validation from this runbook.
