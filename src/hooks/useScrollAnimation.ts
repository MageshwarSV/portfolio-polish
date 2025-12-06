import { useScroll, useTransform, useSpring, useMotionValue, MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type ScrollOffset = [string, string] | [number, number];

// Hook for tracking scroll progress within an element
export const useScrollProgress = (offset: ScrollOffset = ["start end", "end start"]) => {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: offset as any,
    });
    return { ref, scrollYProgress };
};

// Hook for parallax effect with mobile optimization
export const useParallax = (value: MotionValue<number>, distance: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    // Reduce parallax distance on mobile for smoother scroll
    const adjustedDistance = isMobile ? distance * 0.3 : distance;
    return useTransform(value, [0, 1], [-adjustedDistance, adjustedDistance]);
};

// Hook for element visibility on scroll
export const useScrollReveal = (threshold: number = 0.2) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
};

// Hook for smooth mouse position
export const useSmoothMouse = (smoothing: number = 0.1) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return { x: smoothX, y: smoothY, rawX: mouseX, rawY: mouseY };
};

// Hook for scroll direction detection
export const useScrollDirection = () => {
    const [direction, setDirection] = useState<"up" | "down">("down");
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setDirection(currentScrollY > lastScrollY.current ? "down" : "up");
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return direction;
};

// Hook for scroll-to-section functionality
export const useScrollToSection = () => {
    const scrollTo = (sectionId: string, offset: number = 0) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    return scrollTo;
};

// Hook for magnetic effect
export const useMagnetic = (strength: number = 0.3) => {
    const ref = useRef<HTMLElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            x.set((e.clientX - centerX) * strength);
            y.set((e.clientY - centerY) * strength);
        };

        const handleMouseLeave = () => {
            x.set(0);
            y.set(0);
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            element.removeEventListener("mousemove", handleMouseMove);
            element.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [strength, x, y]);

    return { ref, x: useSpring(x, { stiffness: 150, damping: 15 }), y: useSpring(y, { stiffness: 150, damping: 15 }) };
};

// Hook for text reveal animation
export const useTextReveal = () => {
    const splitText = (text: string): string[] => {
        return text.split("");
    };

    const splitWords = (text: string): string[] => {
        return text.split(" ");
    };

    return { splitText, splitWords };
};
