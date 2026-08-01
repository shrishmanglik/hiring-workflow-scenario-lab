# Recovery model

## Typed failures

- `BLOCKED`: evidence is complete and a named invariant rejected the change.
- `INDETERMINATE`: source completeness or detector health is insufficient to make a clean claim.
- API `400`: the caller violated the typed request contract; retrying unchanged input will not help.
- API `503`: the run failed before a receipt was sealed; retry is allowed and production remains unchanged.

## Retry

The UI retains the selected fixture when the API fails and exposes a retry action. A deterministic blocked result can be rerun after its exact input is repaired. Identical inputs must return an identical receipt.

## Rollback

The product never changes production. "Restore accepted" resets the local scenario controls to the known-good fixture. The approval packet separately instructs a customer operator to restore the last accepted workflow configuration if they later execute a production change outside this product.

## Detector recovery

An unhealthy required detector forces `INDETERMINATE`. Recovery requires:

1. restore the detector/source feed;
2. run a known-positive canary and observe the expected rejection;
3. run the clean control and observe pass;
4. repeat the original scenario twice;
5. compare normalized decisions and receipt digests;
6. route the immutable packet to a distinct reviewer.
