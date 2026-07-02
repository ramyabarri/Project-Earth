// Base-path aware asset URLs so the app works from any host, subpath, or
// static file server (BASE_URL follows vite.config `base`).
export const ASSET_BASE = import.meta.env.BASE_URL;

export const asset = (path) => `${ASSET_BASE}${path.replace(/^\//, '')}`;

// Local draco decoder (bundled in public/draco) — no CDN needed.
export const DRACO_PATH = asset('draco/');

// Bundled woff for drei/troika <Text> so 3D labels never hit a CDN.
// (troika supports woff v1, not woff2)
import interWoff from '@fontsource/inter/files/inter-latin-600-normal.woff?url';
export const TEXT_FONT = interWoff;
