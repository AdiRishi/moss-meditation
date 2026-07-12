# Zen Design

> **Status: complete design-review package.** High-fidelity boards and the editable brand deck are ready for product-owner review. The package remains unapproved until that review is complete.

This directory is the future canonical design handoff for Zen. It translates the product intent in [`VISION.md`](../VISION.md) and [`PRODUCT.md`](../PRODUCT.md) into a visual system and screen set.

## Provenance

| Artifact | Source | Current status |
| --- | --- | --- |
| `VISION.md` and `PRODUCT.md` | The product direction described by the project owner | Committed product source |
| `BRAND.md` | Prior brand deck, product documents, and editorial synthesis | Complete proposal; awaiting approval |
| `SCREENS.md` | Product documents, prior screen boards, and product-design synthesis | Complete surface inventory; awaiting approval |
| `tokens.json` | Prior deck values translated into machine-readable tokens | Complete handoff proposal; awaiting approval |
| `assets/zen-enso.png` and `assets/zen-app-icon.png` | Approved production app assets | Existing source assets copied for handoff |
| `screens/` | ImageGen outputs based on the selected prior-art direction | Five complete high-fidelity boards; awaiting approval |
| `brand-deck/` | Editable presentation assembled from the written system and generated boards | PPTX, PDF, and 16 rendered slides complete; awaiting approval |

## Contents

- [`BRAND.md`](./BRAND.md) — draft identity, colour, typography, layout, motion, sound, voice, and accessibility specifications.
- [`SCREENS.md`](./SCREENS.md) — proposed product-surface inventory and interaction intent.
- `assets/` — production-ready identity and visual assets used by the design system.
- `screens/` — high-fidelity UI boards covering every planned app surface.
- `brand-deck/` — editable presentation, PDF, and rendered slides for the full brand and product design system.
- [`PROMPTS.md`](./PROMPTS.md) — generation prompts, references, and provenance for the visual boards.

The assets in `previous-design-work/` remain untouched and continue to serve as the selected visual reference until this package is explicitly approved. App theming should not be changed and the prior folder should not be removed before that approval.
