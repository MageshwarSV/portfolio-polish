import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { Terminal, ChevronRight, Loader2 } from "lucide-react";

// Terminal output line with staggered animation
const TerminalLine = ({
    children,
    prompt = false,
    success = false,
    dim = false,
    delay = 0,
}: {
    children: React.ReactNode;
    prompt?: boolean;
    success?: boolean;
    dim?: boolean;
    delay?: number;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: delay / 1000 }}
            className={`font-mono text-sm leading-6 ${success ? "text-green-400" :
                dim ? "text-muted-foreground/60" :
                    "text-foreground/90"
                }`}
        >
            {prompt && (
                <span className="text-primary mr-2">
                    <span className="text-green-400">➜</span>
                    <span className="text-cyan-400 ml-1">~/career</span>
                    <span className="text-muted-foreground ml-1">$</span>
                </span>
            )}
            {children}
        </motion.div>
    );
};

const StoryExperience = () => {
    const { data: portfolioData, loading } = usePortfolio();
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentExpIndex, setCurrentExpIndex] = useState(0);
    const [phase, setPhase] = useState<"typing" | "connected" | "output" | "loading_next">("typing");

    // Use data from portfolio or fallback to empty array
    const experiences = portfolioData?.experiences || [];

    // Limit to 4 experiences
    const cards = experiences.slice(0, 4);
    const currentExp = cards[currentExpIndex];

    // Animation sequence with proper timing
    useEffect(() => {
        if (loading || cards.length === 0) return;

        setPhase("typing");

        const connectedTimer = setTimeout(() => setPhase("connected"), 2000);
        const outputTimer = setTimeout(() => setPhase("output"), 2500);
        const loadingNextTimer = setTimeout(() => setPhase("loading_next"), 7500);
        const nextTimer = setTimeout(() => {
            setCurrentExpIndex((prev) => (prev + 1) % cards.length);
        }, 9500);

        return () => {
            clearTimeout(connectedTimer);
            clearTimeout(outputTimer);
            clearTimeout(loadingNextTimer);
            clearTimeout(nextTimer);
        };
    }, [currentExpIndex, cards.length]);

    return (
        <section ref={containerRef} className="relative py-24 bg-background overflow-hidden">
            {/* Chapter header */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="container-custom flex items-center gap-4 mb-12"
            >
                <span className="text-primary font-display text-5xl md:text-6xl font-bold opacity-20">02</span>
                <div>
                    <span className="text-primary text-sm uppercase tracking-widest">Chapter Two</span>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">My Journey</h2>
                </div>
            </motion.div>

            {/* Terminal container */}
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6 }}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* Terminal window */}
                    <div className="rounded-2xl overflow-hidden border border-border/50 bg-[#0d1117] shadow-2xl">
                        {/* Terminal header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-border/30">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                                <Terminal className="w-3 h-3" />
                                <span>career-explorer v2.0</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {cards.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentExpIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentExpIndex
                                            ? "bg-primary scale-125"
                                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Terminal body - Responsive height */}
                        <div className="p-4 md:p-5 min-h-[380px] md:h-[420px] font-mono text-xs md:text-sm overflow-hidden">
                            {/* Fetching message */}
                            <TerminalLine dim>
                                Fetching experience #{currentExpIndex + 1} of {cards.length}...
                            </TerminalLine>

                            {/* Command */}
                            <div className="mt-2">
                                <TerminalLine prompt>
                                    <span className="text-foreground/90">
                                        experience --get "{currentExp?.company || "..."}"
                                    </span>
                                    {phase === "typing" && (
                                        <motion.span
                                            className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        />
                                    )}
                                </TerminalLine>
                            </div>

                            {/* Show basic loading state if no data yet */}
                            {(!currentExp || loading) && (
                                <div className="mt-8 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                                    <p className="text-xs font-mono">Initializing data stream...</p>
                                </div>
                            )}

                            {/* Connecting... (during typing phase) */}
                            {phase === "typing" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2"
                                >
                                    <TerminalLine dim>
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                            Connecting to experience database...
                                        </span>
                                    </TerminalLine>
                                </motion.div>
                            )}

                            {/* Connected! (shows briefly) */}
                            {(phase === "connected" || phase === "output" || phase === "loading_next") && (
                                <div className="mt-2">
                                    <TerminalLine dim delay={0}>
                                        <span className="flex items-center gap-2">
                                            <span className="text-green-400">✓</span>
                                            Connected to experience database
                                        </span>
                                    </TerminalLine>
                                </div>
                            )}

                            {/* Output - Line by line with delays */}
                            <AnimatePresence mode="wait">
                                {currentExp && (phase === "output" || phase === "loading_next") && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-3"
                                    >
                                        {/* Separator */}
                                        <TerminalLine success delay={0}>
                                            <span className="hidden md:inline">════════════════════════════════════════════════</span>
                                            <span className="md:hidden">══════════════════════════</span>
                                        </TerminalLine>

                                        {/* ROLE - delay 300ms */}
                                        <TerminalLine delay={300}>
                                            <span className="text-cyan-400">ROLE:</span>{" "}
                                            <span className="text-yellow-300 font-semibold">{currentExp.title}</span>
                                        </TerminalLine>

                                        {/* COMPANY - delay 600ms */}
                                        <TerminalLine delay={600}>
                                            <span className="text-cyan-400">COMPANY:</span>{" "}
                                            <span className="text-primary font-semibold">{currentExp.company}</span>
                                        </TerminalLine>

                                        {/* PERIOD - delay 900ms */}
                                        <TerminalLine delay={900}>
                                            <span className="text-cyan-400">PERIOD:</span>{" "}
                                            <span className="text-purple-400">{currentExp.period}</span>
                                        </TerminalLine>

                                        {/* STATUS - delay 1200ms */}
                                        <TerminalLine delay={1200}>
                                            <span className="text-cyan-400">STATUS:</span>{" "}
                                            <span className={`px-2 py-0.5 rounded text-xs ${currentExp.type === "current"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-blue-500/20 text-blue-400"
                                                }`}>
                                                {currentExp.type === "current" ? "● ACTIVE" : "○ COMPLETED"}
                                            </span>
                                        </TerminalLine>

                                        {/* Separator - delay 1500ms */}
                                        <TerminalLine success delay={1500}>
                                            <span className="hidden md:inline">════════════════════════════════════════════════</span>
                                            <span className="md:hidden">══════════════════════════</span>
                                        </TerminalLine>

                                        {/* Key achievements header - delay 1800ms */}
                                        <TerminalLine dim delay={1800}>
                                            <span className="text-muted-foreground">// Key achievements:</span>
                                        </TerminalLine>

                                        {/* Highlights - staggered from 2100ms */}
                                        {currentExp.highlights.slice(0, 3).map((highlight, index) => (
                                            <TerminalLine key={index} delay={2100 + index * 400}>
                                                <span className="text-green-400 mr-2">
                                                    <ChevronRight className="w-3 h-3 inline" />
                                                </span>
                                                <span className="text-foreground/80">{highlight}</span>
                                            </TerminalLine>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Loading next experience message */}
                            {phase === "loading_next" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4"
                                >
                                    <TerminalLine prompt>
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                            Loading next experience...
                                        </span>
                                    </TerminalLine>
                                </motion.div>
                            )}
                        </div>

                        {/* Terminal footer - Progress bar */}
                        <div className="px-5 py-3 bg-[#161b22] border-t border-border/30">
                            <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mb-2">
                                <span>Experience {currentExpIndex + 1}/{cards.length}</span>
                                <span className="text-primary">
                                    {phase === "typing" && "■ Connecting..."}
                                    {phase === "connected" && "■ Connected"}
                                    {phase === "output" && "■ Displaying data..."}
                                    {phase === "loading_next" && "■ Loading next..."}
                                </span>
                            </div>
                            {/* Progress bar */}
                            <motion.div className="h-1 rounded-full bg-border/30 overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary via-accent to-primary"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 9.5, ease: "linear" }}
                                    key={currentExpIndex}
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 -z-10 blur-3xl opacity-15"
                        style={{ background: "var(--gradient-primary)" }}
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default StoryExperience;
