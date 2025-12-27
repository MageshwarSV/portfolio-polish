import { useEffect, useState, useMemo } from "react";
import { useAnimationConfig } from "@/contexts/PerformanceContext";
import { ThemeSettings } from "@/lib/themeSettings";

interface AIParticlesProps {
    themeSettings?: ThemeSettings;
}

const AIParticles = ({ themeSettings }: AIParticlesProps) => {
    const config = useAnimationConfig();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine colors
    const baseColor = themeSettings?.colors?.foreground || "#ffffff";
    const accentColor = themeSettings?.colors?.primary || "#00ff9d";

    // Generate static particles based on config count
    const particles = useMemo(() => {
        if (!config.enableParticles || config.particleCount === 0) return [];

        return Array.from({ length: config.particleCount }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.random() * 4 + 2 + "px", // 2px to 6px
            delay: Math.random() * 5 + "s",
            duration: Math.random() * 10 + 10 + "s", // 10-20s float duration
            opacity: Math.random() * 0.3 + 0.1,
            isAccent: Math.random() > 0.7 // 30% are accent colored
        }));
    }, [config.particleCount, config.enableParticles]);

    if (!mounted || !config.enableParticles) return null;

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.isAccent ? accentColor : baseColor,
                        opacity: p.opacity,
                        animation: `float ${p.duration} ease-in-out infinite`,
                        animationDelay: `-${p.delay}`, // Negative delay to start mid-animation
                    }}
                />
            ))}

            {/* Inject Keyframes locally to ensure they exist */}
            <style>{`
                @keyframes float {
                    0% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, -20px); }
                    100% { transform: translate(0, 0); }
                }
            `}</style>
        </div>
    );
};

export default AIParticles;
