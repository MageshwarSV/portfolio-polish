import { ReactNode, useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { useAnimationConfig } from "@/contexts/PerformanceContext";

interface SmoothScrollProviderProps {
    children: ReactNode;
}

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
    const lenisRef = useRef<Lenis | null>(null);
    const animationConfig = useAnimationConfig();

    useEffect(() => {
        // Adaptive smooth scroll settings based on device performance
        const duration = 1.0 * animationConfig.animationDuration;
        const lerp = animationConfig.animationDuration >= 1 ? 0.1 : 0.15; // Faster lerp for lower performance
        
        const lenis = new Lenis({
            duration, // Adjusted based on device
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.2, // Responsive wheel
            touchMultiplier: 2,
            infinite: false,
            lerp, // Adaptive smoothness
        });

        lenisRef.current = lenis;

        // High-performance RAF loop
        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // Anchor click handling
        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach((anchor) => {
            anchor.addEventListener("click", (e) => {
                e.preventDefault();
                const href = anchor.getAttribute("href");
                if (href) {
                    const target = document.querySelector(href);
                    if (target) {
                        lenis.scrollTo(target as HTMLElement, {
                            offset: 0,
                            duration: 1.2,
                        });
                    }
                }
            });
        });

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [animationConfig.animationDuration]);

    return <>{children}</>;
};

export default SmoothScrollProvider;
