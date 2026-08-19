# Synnical SVG CDN asset retention

Files under `assets/` that use content-hashed filenames are intentionally
retained across releases.

The permanent `@main/synnical-###.svg` URLs may remain cached independently
from `@main/assets/...` URLs. Removing an old hashed chunk can therefore break
a cached SVG that still references it.

New releases must MERGE new build assets into this directory rather than
deleting the whole `assets/` directory first.

Do not remove historical hashed JS/CSS assets during normal releases.
