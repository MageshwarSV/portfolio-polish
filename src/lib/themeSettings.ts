// Theme and Particle Settings for Visual Customization
import { db } from './firebase';
import { ref, get, set, push, remove } from 'firebase/database';

// Custom preset interface
export interface CustomPreset {
    id: string;
    name: string;
    primary: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    foreground: string;
    muted: string;
    createdAt: number;
}

// Default theme configuration
export interface ThemeSettings {
    colors: {
        primary: string;      // Main accent color (cyan by default)
        accent: string;       // Secondary accent (purple/pink glow)
        background: string;   // Main background
        backgroundAlt: string; // Card/section backgrounds
        foreground: string;   // Main text color
        muted: string;        // Muted/secondary text
    };
    particles: {
        enabled: boolean;
        count: number;        // Number of floating particles
        techLabels: boolean;  // Show floating tech labels (Python, React, etc.)
        neuralLines: boolean; // Show connecting neural network lines
        orbsEnabled: boolean; // Show glowing orbs
        orbsOpacity: number;  // Orbs opacity (0-100)
        animationSpeed: number; // Animation speed multiplier (0.5-2)
    };
    effects: {
        customCursor: boolean;
        smoothScroll: boolean;
        noiseOverlay: boolean;
        noiseOpacity: number; // 0-100
    };
}

export const defaultThemeSettings: ThemeSettings = {
    colors: {
        primary: '#10b981',      // Emerald/teal
        accent: '#8b5cf6',       // Purple
        background: '#030712',   // Near black
        backgroundAlt: '#0f172a', // Dark slate
        foreground: '#f8fafc',   // White
        muted: '#94a3b8',        // Slate gray
    },
    particles: {
        enabled: true,
        count: 20,
        techLabels: true,
        neuralLines: true,
        orbsEnabled: true,
        orbsOpacity: 5,
        animationSpeed: 1,
    },
    effects: {
        customCursor: true,
        smoothScroll: true,
        noiseOverlay: true,
        noiseOpacity: 0.5,
    },
};

// Get theme settings from Firebase
export const getThemeSettings = async (): Promise<ThemeSettings> => {
    try {
        const themeRef = ref(db, 'settings/theme');
        const snapshot = await get(themeRef);
        if (snapshot.exists()) {
            return { ...defaultThemeSettings, ...snapshot.val() };
        }
    } catch (error) {
        console.error('Error getting theme settings:', error);
    }
    return defaultThemeSettings;
};

// Save theme settings to Firebase
export const saveThemeSettings = async (settings: ThemeSettings): Promise<boolean> => {
    try {
        const themeRef = ref(db, 'settings/theme');
        await set(themeRef, settings);
        return true;
    } catch (error) {
        console.error('Error saving theme settings:', error);
        return false;
    }
};

// Get custom presets from Firebase
export const getCustomPresets = async (): Promise<CustomPreset[]> => {
    try {
        const presetsRef = ref(db, 'settings/customPresets');
        const snapshot = await get(presetsRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.entries(data).map(([id, preset]: [string, any]) => ({
                id,
                ...preset
            }));
        }
    } catch (error) {
        console.error('Error getting custom presets:', error);
    }
    return [];
};

// Save a new custom preset
export const saveCustomPreset = async (name: string, colors: ThemeSettings['colors']): Promise<boolean> => {
    try {
        const presetsRef = ref(db, 'settings/customPresets');
        const newPresetRef = push(presetsRef);
        await set(newPresetRef, {
            name,
            primary: colors.primary,
            accent: colors.accent,
            background: colors.background,
            backgroundAlt: colors.backgroundAlt,
            foreground: colors.foreground,
            muted: colors.muted,
            createdAt: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Error saving custom preset:', error);
        return false;
    }
};

// Delete a custom preset
export const deleteCustomPreset = async (presetId: string): Promise<boolean> => {
    try {
        const presetRef = ref(db, `settings/customPresets/${presetId}`);
        await remove(presetRef);
        return true;
    } catch (error) {
        console.error('Error deleting custom preset:', error);
        return false;
    }
};

// Apply theme to CSS variables
export const applyTheme = (settings: ThemeSettings) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Colors
    root.style.setProperty('--color-primary', settings.colors.primary);
    root.style.setProperty('--color-accent', settings.colors.accent);
    root.style.setProperty('--color-background', settings.colors.background);
    root.style.setProperty('--color-background-alt', settings.colors.backgroundAlt);
    root.style.setProperty('--color-foreground', settings.colors.foreground);
    root.style.setProperty('--color-muted', settings.colors.muted);

    // Effects
    root.style.setProperty('--noise-opacity', (settings.effects.noiseOpacity / 100).toString());

    // Convert hex to HSL for Tailwind CSS variables
    const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply HSL values for Tailwind
    root.style.setProperty('--primary', hexToHsl(settings.colors.primary));
    root.style.setProperty('--accent', hexToHsl(settings.colors.accent));
};

// Reset theme to defaults
export const resetThemeSettings = async (): Promise<boolean> => {
    return await saveThemeSettings(defaultThemeSettings);
};
