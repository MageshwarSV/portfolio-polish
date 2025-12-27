import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { techStack as defaultTechStack } from "@/data/storytellingData";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAnimationConfig } from "@/contexts/PerformanceContext";
import { ThemeSettings, defaultThemeSettings } from "@/lib/themeSettings";

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    label?: string;
    delay: number;
    duration: number;
}

interface AIParticlesProps {
    themeSettings?: ThemeSettings;
}

// Separate component for labeled particles to keep hooks at top level
const LabeledParticle = ({
    particle,
    smoothMouseX,
    smoothMouseY
}: {
    particle: Particle;
    smoothMouseX: any;
    smoothMouseY: any;
}) => {
    const xOffset = useTransform(smoothMouseX, [0, 1], [-10, 10]);
    const yOffset = useTransform(smoothMouseY, [0, 1], [-10, 10]);

    return (
        <motion.div
            className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-medium text-primary/40 whitespace-nowrap"
            whileHover={{ scale: 1.1, color: "hsl(var(--primary) / 0.8)", backgroundColor: "hsl(var(--primary) / 0.1)" }}
            style={{ x: xOffset, y: yOffset }}
        >
            {particle.label}
        </motion.div>
    );
};

// Separate component for dot particles
const DotParticle = ({
    particle,
    smoothMouseX,
    smoothMouseY
}: {
    particle: Particle;
    smoothMouseX: any;
    smoothMouseY: any;
}) => {
    const xOffset = useTransform(smoothMouseX, [0, 1], [-5, 5]);
    const yOffset = useTransform(smoothMouseY, [0, 1], [-5, 5]);

    return (
        <motion.div
            className="rounded-full bg-primary/20"
            style={{
                width: particle.size,
                height: particle.size,
                boxShadow: `0 0 ${particle.size * 2}px hsl(var(--primary) / 0.2)`,
                x: xOffset,
                y: yOffset,
            }}
        />
    );
};

// Glowing orb component
const GlowingOrb = ({
    className,
    smoothMouseX,
    smoothMouseY,
    xRange,
    yRange,
    animateProps,
    duration,
    delay = 0
}: {
    className: string;
    smoothMouseX: any;
    smoothMouseY: any;
    xRange: [number, number];
    yRange: [number, number];
    animateProps: any;
    duration: number;
    delay?: number;
}) => {
    const xOffset = useTransform(smoothMouseX, [0, 1], xRange);
    const yOffset = useTransform(smoothMouseY, [0, 1], yRange);

    return (
        <motion.div
            className={className}
            style={{
                background: "var(--gradient-primary)",
                x: xOffset,
                y: yOffset,
            }}
            animate={animateProps}
            transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        />
    );
};

const AIParticles = ({ themeSettings = defaultThemeSettings }: AIParticlesProps) => {
    const { data: portfolioData } = usePortfolio();
    const containerRef = useRef<HTMLDivElement>(null);
    const [particles, setParticles] = useState<Particle[]>([]);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const animationConfig = useAnimationConfig();

    // Use data from portfolio context
    const techStack = portfolioData?.techstack || defaultTechStack;

    const springConfig = { damping: 25, stiffness: 100 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);

    // Get particle configuration from theme settings
    const showTechLabels = themeSettings.particles.techLabels;
    const showNeuralLines = themeSettings.particles.neuralLines;
    const showOrbs = themeSettings.particles.orbsEnabled;
    const orbsOpacity = themeSettings.particles.orbsOpacity / 100;
    const particleCount = themeSettings.particles.count || animationConfig.particleCount || 20;

    useEffect(() => {
        const newParticles: Particle[] = [];

        // Main floating particles (dots) - Adaptive count
        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 2,
                delay: Math.random() * 5,
                duration: Math.random() * 10 + 15,
            });
        }

        // Tech label particles - Only show if enabled in theme settings
        if (showTechLabels) {
            const techLabelCount = particleCount >= 15 ? 8 : particleCount >= 10 ? 4 : 0;
            techStack.slice(0, techLabelCount).forEach((tech: string, i: number) => {
                newParticles.push({
                    id: 100 + i,
                    x: 10 + (i % 3) * 30 + Math.random() * 10,
                    y: 15 + Math.floor(i / 3) * 60 + Math.random() * 20,
                    size: 6,
                    label: tech,
                    delay: i * 0.5,
                    duration: 20 + Math.random() * 10,
                });
            });
        }

        setParticles(newParticles);
    }, [particleCount, techStack, showTechLabels]);

    useEffect(() => {
        // Only track mouse on non-touch devices (desktop/laptop)
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return; // Skip mouse tracking on mobile

        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                mouseX.set((e.clientX - rect.left) / rect.width);
                mouseY.set((e.clientY - rect.top) / rect.height);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{
                opacity: 1,
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh'
            }}
        >
            {/* Neural network lines - controlled by theme settings */}
            {showNeuralLines && (
                <svg className="absolute inset-0 w-full h-full opacity-5">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    {particles.slice(0, 10).map((p, i) => {
                        const nextP = particles[(i + 1) % 10];
                        if (!nextP) return null;
                        return (
                            <motion.line
                                key={`line-${p.id}`}
                                x1={`${p.x}%`}
                                y1={`${p.y}%`}
                                x2={`${nextP.x}%`}
                                y2={`${nextP.y}%`}
                                stroke="url(#lineGradient)"
                                strokeWidth="1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.2 }}
                                transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatType: "reverse", repeatDelay: 5 }}
                            />
                        );
                    })}
                </svg>
            )}

            {/* Floating particles - using dedicated components */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {particle.label ? (
                        <LabeledParticle
                            particle={particle}
                            smoothMouseX={smoothMouseX}
                            smoothMouseY={smoothMouseY}
                        />
                    ) : (
                        <DotParticle
                            particle={particle}
                            smoothMouseX={smoothMouseX}
                            smoothMouseY={smoothMouseY}
                        />
                    )}
                </motion.div>
            ))}

            {/* Glowing orbs - controlled by theme settings */}
            {showOrbs && animationConfig.enableComplexAnimations && (
                <>
                    <GlowingOrb
                        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] hidden md:block"
                        smoothMouseX={smoothMouseX}
                        smoothMouseY={smoothMouseY}
                        xRange={[-50, 50]}
                        yRange={[-50, 50]}
                        animateProps={{ scale: [1, 1.2, 1], opacity: [orbsOpacity * 0.5, orbsOpacity, orbsOpacity * 0.5] }}
                        duration={8}
                    />
                    <GlowingOrb
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] hidden md:block"
                        smoothMouseX={smoothMouseX}
                        smoothMouseY={smoothMouseY}
                        xRange={[30, -30]}
                        yRange={[30, -30]}
                        animateProps={{ scale: [1.2, 1, 1.2], opacity: [orbsOpacity * 0.3, orbsOpacity * 0.8, orbsOpacity * 0.3] }}
                        duration={10}
                        delay={2}
                    />
                </>
            )}
        </motion.div>
    );
};

export default AIParticles;
