# Target: mobile

Modeled abstractly. Concrete stack (e.g. Flutter, React Native, native) is chosen when mobile is first built. Until then, mobile projection nodes exist as `planned` placeholders to prove the apply-state / per-target rollout model.

- Stack: `abstract`
- Lowering: `Screen` (Page@mobile) -> a screen calling the same backend endpoints as web.
- Hard rule: same external-isolation rule as web — the backend is the only gateway to external services.
