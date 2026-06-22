import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import { setMFEAssetBase } from './utils/assetUrl';
import { challengeProgressService } from './services/challengeProgressService';
import { useGameStore } from './store/useGameStore';
import './tailwind.css';

if (import.meta.env.PROD) {
    const noop = () => { };
    console.log = noop;
    console.info = noop;
}

let reactRoot: ReactDOM.Root | null = null;

function injectMFEFonts(): void {
    if (!document.getElementById('shadow-builder-fonts')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'shadow-builder-fonts';
        fontLink.rel = 'stylesheet';
        // Shadow Builder uses Baloo 2 + Nunito (game UI) and Gabarito (shell chrome).
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;600;700;800&family=Gabarito:wght@400;500;600;700;800;900&display=swap';
        document.head.appendChild(fontLink);
        console.log('[ShadowBuilder MFE] Fonts loaded');
    }
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <pre className="text-sm text-red-500 mb-4 max-w-lg overflow-auto">{error.message}</pre>
            <button
                onClick={resetErrorBoundary}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                Try again
            </button>
        </div>
    );
}

interface MFEProps {
    domElement?: HTMLElement;
    containerId?: string;
    eventBus?: {
        emit: (event: string, data: any) => void;
        on: (event: string, callback: (data: any) => void) => () => void;
    };
    firebase?: {
        auth: any;
        db: any;
        getCurrentUser: () => any;
        isAuthenticated: () => boolean;
    };
    user?: any;
    onClose?: () => void;
    onNavigate?: (path: string, replace?: boolean) => void;
    onError?: (error: Error) => void;
    mfeName?: string;
    mfeVersion?: string;
    assetBase?: string;
    soundSettings?: {
        isMusicOn: boolean;
        isSoundOn: boolean;
    };
}

export async function bootstrap(props: MFEProps): Promise<void> {
    console.log('[ShadowBuilder MFE] Bootstrapping', props);
    injectMFEFonts();
    return Promise.resolve();
}

export async function mount(props: MFEProps): Promise<void> {
    console.log('[ShadowBuilder MFE] Mounting');
    console.log('[ShadowBuilder MFE] Props received:', props);

    injectMFEFonts();

    let container = props.domElement;

    if (!container && props.containerId) {
        console.log('[ShadowBuilder MFE] domElement not provided, looking for container:', props.containerId);

        let attempts = 0;
        while (!container && attempts < 50) {
            container = document.getElementById(props.containerId) || undefined;
            if (!container) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
    }

    if (!container) {
        const error = 'No container element found. MFEHost must provide a valid container.';
        console.error('[ShadowBuilder MFE]', error);
        return Promise.reject(new Error(error));
    }

    console.log('[ShadowBuilder MFE] Using container:', container);

    container.style.position = 'relative';
    container.style.zIndex = '50';
    container.style.overflow = 'visible';

    container.classList.add('shadow-builder-mfe');

    // Set MFE asset base URL for loading assets
    const mfeBaseUrl = props.assetBase || '/mfe/shadow-builder';
    setMFEAssetBase(mfeBaseUrl);
    console.log('[ShadowBuilder MFE] Asset base URL set to:', mfeBaseUrl);

    // Connect event bus to progress service
    if (props.eventBus) {
        challengeProgressService.setEventBus(props.eventBus);
        console.log('[ShadowBuilder MFE] Event bus connected to progress service');
    }

    // CRITICAL: Reset game store to initial state on each mount
    // This ensures a fresh game instance when MFE is reopened
    useGameStore.getState().resetGame();
    console.log('[ShadowBuilder MFE] Game store reset to initial state');

    reactRoot = ReactDOM.createRoot(container);
    reactRoot.render(
        <React.StrictMode>
            <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onError={(error) => {
                    console.error('[ShadowBuilder MFE] Error caught by boundary:', error);
                    props.onError?.(error);
                }}
            >
                <App eventBus={props.eventBus} />
            </ErrorBoundary>
        </React.StrictMode>
    );

    console.log('[ShadowBuilder MFE] Mounted successfully');
    return Promise.resolve();
}

export async function unmount(props: MFEProps): Promise<void> {
    console.log('[ShadowBuilder MFE] Unmounting');

    try {
        // Cleanup progress service event listeners
        challengeProgressService.cleanup();
        console.log('[ShadowBuilder MFE] Progress service cleaned up');
    } catch (error) {
        console.warn('[ShadowBuilder MFE] Error cleaning up progress service:', error);
    }

    if (reactRoot) {
        reactRoot.unmount();
        reactRoot = null;
        console.log('[ShadowBuilder MFE] React root unmounted');
    }

    return Promise.resolve();
}

// Development standalone mode
if (import.meta.env.DEV) {
    const devRoot = document.getElementById('root');
    if (devRoot && !devRoot.hasChildNodes()) {
        console.log('[ShadowBuilder MFE] Running in development standalone mode');
        mount({
            domElement: devRoot,
            assetBase: '',
        });
    }
}
