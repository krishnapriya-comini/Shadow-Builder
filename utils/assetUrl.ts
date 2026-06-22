/**
 * Asset URL utility for MFE mode
 * 
 * In MFE mode, assets must be loaded from the CDN base URL (e.g., R2 bucket)
 * In standalone mode, assets are loaded from the local /assets/ directory
 */

// Base URL for assets when running as MFE
let mfeAssetBase = '';

/**
 * Set the base URL for assets when running as MFE
 * Called during MFE mount lifecycle
 */
export function setMFEAssetBase(base: string) {
    mfeAssetBase = base;
    console.log('[AssetUrl] MFE asset base set to:', base);
}

/**
 * Get the full URL for an asset
 * @param path - Asset path (e.g., '/assets/image.png')
 * @returns Full URL (CDN URL in MFE mode, or just the path in standalone)
 */
export function getAssetUrl(path: string): string {
    // Normalize path to start with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (mfeAssetBase) {
        const url = `${mfeAssetBase}${normalizedPath}`;
        // console.log('[AssetUrl] Resolved:', path, '->', url);
        return url;
    }
    // console.log('[AssetUrl] Standalone mode, using local path:', normalizedPath);
    return normalizedPath;
}

/**
 * Get the base URL for assets (for dynamic imports or complex scenarios)
 */
export function getAssetBaseUrl(): string {
    return mfeAssetBase || '';
}

export default getAssetUrl;
