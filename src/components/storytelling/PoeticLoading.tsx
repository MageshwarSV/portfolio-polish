import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const quotes = [
    "Every line of code tells a story...",
    "Every algorithm solves a problem...",
    "Every project changes the world...",
    "Let me show you mine.",
];

// Check if device is mobile/low-performance
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 768
        || 'ontouchstart' in window;
};

// Floating code particles
const CodeParticle = ({ delay, duration }: { delay: number; duration: number }) => {
    const characters = ["</>", "{}", "[]", "=>", "//", "&&", "||", "++", "==", "!=", "fn", "()"];
    const char = characters[Math.floor(Math.random() * characters.length)];
    const startX = Math.random() * 100;
    const endX = startX + (Math.random() - 0.5) * 30;

    return (
        <motion.div
            className="absolute text-primary/20 font-mono text-sm pointer-events-none"
            style={{ left: `${startX}%` }}
            initial={{ y: "100vh", opacity: 0, rotate: 0 }}
            animate={{
                y: "-10vh",
                opacity: [0, 1, 1, 0],
                rotate: Math.random() > 0.5 ? 360 : -360,
                x: `${endX - startX}%`
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            {char}
        </motion.div>
    );
};

// Orbiting ring
const OrbitRing = ({ size, duration, reverse }: { size: number; duration: number; reverse?: boolean }) => (
    <motion.div
        className="absolute rounded-full border border-primary/10"
        style={{
            width: size,
            height: size,
            left: "50%",
            top: "50%",
            marginLeft: -size / 2,
            marginTop: -size / 2,
        }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
        <motion.div
            className="absolute w-2 h-2 rounded-full bg-primary"
            style={{
                top: -4,
                left: "50%",
                marginLeft: -4,
                boxShadow: "0 0 15px hsl(var(--primary))",
            }}
        />
    </motion.div>
);

// DNA Helix
const DNAHelix = () => {
    const points = 12;
    return (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 h-[60%] flex flex-col justify-between opacity-20">
            {[...Array(points)].map((_, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-4"
                    animate={{ x: [0, 20, 0, -20, 0] }}
                    transition={{ duration: 3, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                >
                    <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                    />
                    <motion.div
                        className="w-8 h-[1px] bg-gradient-to-r from-primary to-accent"
                        animate={{ scaleX: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                    />
                    <motion.div
                        className="w-2 h-2 rounded-full bg-accent"
                        animate={{ scale: [1.5, 1, 1.5] }}
                        transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

// Neural network nodes
const NeuralNetwork = () => {
    const nodes = useMemo(() =>
        [...Array(8)].map(() => ({
            x: 70 + Math.random() * 25,
            y: 10 + Math.random() * 80,
            size: 4 + Math.random() * 8,
        })), []
    );

    return (
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 overflow-hidden">
            {nodes.map((node, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-accent"
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        width: node.size,
                        height: node.size,
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2 + Math.random() * 2, delay: i * 0.2, repeat: Infinity }}
                />
            ))}
            <svg className="absolute inset-0 w-full h-full">
                {nodes.map((node, i) =>
                    nodes.slice(i + 1, i + 3).map((target, j) => (
                        <motion.line
                            key={`${i}-${j}`}
                            x1={`${node.x}%`}
                            y1={`${node.y}%`}
                            x2={`${target.x}%`}
                            y2={`${target.y}%`}
                            stroke="hsl(var(--accent))"
                            strokeWidth="1"
                            strokeOpacity="0.3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                        />
                    ))
                )}
            </svg>
        </div>
    );
};

// Morphing shape
const MorphingShape = () => (
    <motion.div
        className="absolute w-32 h-32 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ background: "var(--gradient-primary)", filter: "blur(40px)", opacity: 0.3 }}
        animate={{
            borderRadius: [
                "60% 40% 30% 70%/60% 30% 70% 40%",
                "30% 60% 70% 40%/50% 60% 30% 60%",
                "60% 40% 30% 70%/60% 30% 70% 40%",
            ],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
);

const PoeticLoading = ({ onComplete, isDataReady = true }: { onComplete: () => void, isDataReady?: boolean }) => {
    const [currentLine, setCurrentLine] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const isMobile = isMobileDevice();

    // Generate fewer particles on mobile for better performance
    const particles = useMemo(() =>
        [...Array(isMobile ? 5 : 15)].map(() => ({
            delay: Math.random() * 5,
            duration: 8 + Math.random() * 4,
        })), [isMobile]
    );

    useEffect(() => {
        // Line transition timing
        const duration = isMobile ? 1400 : 2100;
        const timers: NodeJS.Timeout[] = [];

        quotes.forEach((_, index) => {
            timers.push(setTimeout(() => setCurrentLine(index), index * duration));
        });

        return () => timers.forEach((t) => clearTimeout(t));
    }, [isMobile]);

    // Handle completion only when BOTH animation is at last line AND data is ready
    useEffect(() => {
        if (currentLine === quotes.length - 1 && isDataReady && !isComplete) {
            const timer = setTimeout(() => {
                setIsComplete(true);
                // Extra short delay before calling parent onComplete to allow exit animation
                setTimeout(onComplete, isMobile ? 400 : 800);
            }, isMobile ? 1000 : 1800);
            return () => clearTimeout(timer);
        }
    }, [currentLine, isDataReady, isComplete, onComplete, isMobile]);

    return (
        <AnimatePresence>
            {!isComplete && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                    {/* Background grid */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
                            backgroundSize: "60px 60px",
                        }}
                    />

                    {/* Gradient orbs - Simplified on mobile */}
                    {!isMobileDevice() ? (
                        <>
                            <motion.div
                                className="absolute -top-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-30"
                                style={{ background: "var(--gradient-primary)" }}
                                animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div
                                className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-20"
                                style={{ background: "var(--gradient-accent)" }}
                                animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 40, 0] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </>
                    ) : (
                        <>
                            <div className="absolute -top-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full blur-[60px] opacity-20"
                                style={{ background: "var(--gradient-primary)" }} />
                            <div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[60px] opacity-15"
                                style={{ background: "var(--gradient-accent)" }} />
                        </>
                    )}

                    {/* Floating code particles - Only on desktop */}
                    {!isMobileDevice() && particles.map((particle, i) => (
                        <CodeParticle key={i} delay={particle.delay} duration={particle.duration} />
                    ))}

                    {/* DNA Helix on left - Only on desktop */}
                    {!isMobileDevice() && <DNAHelix />}

                    {/* Neural network on right - Only on desktop */}
                    {!isMobileDevice() && <NeuralNetwork />}

                    {/* Orbit rings - Simplified on mobile */}
                    {!isMobileDevice() && (
                        <>
                            <OrbitRing size={300} duration={20} />
                            <OrbitRing size={400} duration={30} reverse />
                            <OrbitRing size={500} duration={40} />
                        </>
                    )}

                    {/* Morphing shape - Only on desktop */}
                    {!isMobileDevice() && <MorphingShape />}

                    {/* Central content */}
                    <div className="relative z-10 max-w-4xl px-8 text-center">
                        {/* Logo/Icon - Terminal prompt style like favicon */}
                        <motion.div
                            className="mb-8"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, ease: "backOut" }}
                        >
                            <motion.div
                                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                                animate={{
                                    boxShadow: [
                                        "0 0 20px hsl(var(--primary) / 0.3)",
                                        "0 0 40px hsl(var(--primary) / 0.6)",
                                        "0 0 20px hsl(var(--primary) / 0.3)",
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="text-3xl font-bold text-black font-mono">{">_"}</span>
                            </motion.div>
                        </motion.div>

                        {/* Quote */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentLine}
                                className="font-display text-3xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight"
                                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
                                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                            >
                                <span className="text-gradient">{quotes[currentLine]}</span>
                            </motion.p>
                        </AnimatePresence>

                        {/* Progress bar */}
                        <div className="mt-12 max-w-xs mx-auto">
                            <div className="h-1 bg-secondary/30 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary via-accent to-primary"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${((currentLine + 1) / quotes.length) * 100}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        {/* Loading dots */}
                        <motion.div
                            className="mt-6 flex justify-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-primary"
                                    animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                                />
                            ))}
                        </motion.div>

                        {/* Loading text */}
                        <motion.p
                            className="mt-4 text-xs text-muted-foreground font-mono uppercase tracking-widest"
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {currentLine === quotes.length - 1 && !isDataReady
                                ? "Synchronizing with cloud..."
                                : "Initializing Experience..."}
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PoeticLoading;
