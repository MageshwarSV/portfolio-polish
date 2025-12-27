import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { ThemeSettings, defaultThemeSettings, applyTheme } from '@/lib/themeSettings';

export const useThemeSettings = () => {
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const themeRef = ref(db, 'settings/theme');

        // Real-time listener for theme changes
        const unsubscribe = onValue(themeRef, (snapshot) => {
            if (snapshot.exists()) {
                const settings = { ...defaultThemeSettings, ...snapshot.val() };
                setThemeSettings(settings);
                applyTheme(settings);
            } else {
                // Use defaults if no theme settings in database
                setThemeSettings(defaultThemeSettings);
                applyTheme(defaultThemeSettings);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to theme settings:", error);
            setThemeSettings(defaultThemeSettings);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { themeSettings, loading };
};
