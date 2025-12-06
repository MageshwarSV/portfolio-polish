import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailPoint {
    x: number;
    y: number;
    id: number;
}

const CustomCursor = () => {
    // Early return for touch devices and mobile - Don't initialize anything
    if (typeof window !== "undefined") {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        
        if (isTouchDevice || isMobile || isSmallScreen) {
            return null;
        }
    }

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [trail, setTrail] = useState<TrailPoint[]>([]);
    const [isClicking, setIsClicking] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isMoving, setIsMoving] = useState(false);

    const addToTrail = useCallback((x: number, y: number) => {
        const newPoint = { x, y, id: Date.now() + Math.random() };
        setTrail((prev) => [...prev.slice(-12), newPoint]);
    }, []);

    useEffect(() => {
        let animationFrame: number;
        let moveTimeout: ReturnType<typeof setTimeout>;
        let fadeInterval: ReturnType<typeof setInterval>;

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            setIsMoving(true);
            addToTrail(e.clientX, e.clientY);

            // Start fading trail after mouse stops moving
            clearTimeout(moveTimeout);
            clearInterval(fadeInterval);
            moveTimeout = setTimeout(() => {
                setIsMoving(false);
                // Gradually remove trail particles one by one
                fadeInterval = setInterval(() => {
                    setTrail((prev) => {
                        if (prev.length === 0) {
                            clearInterval(fadeInterval);
                            return prev;
                        }
                        return prev.slice(1); // Remove oldest particle
                    });
                }, 30); // Remove one particle every 30ms for smooth fade
            }, 100);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                target.closest("a") ||
                target.closest("button") ||
                target.classList.contains("cursor-hover")
            ) {
                setIsHovering(true);
            }
        };

        const handleMouseOut = () => setIsHovering(false);

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mouseover", handleMouseOver);
        window.addEventListener("mouseout", handleMouseOut);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mouseover", handleMouseOver);
            window.removeEventListener("mouseout", handleMouseOut);
            clearTimeout(moveTimeout);
            clearInterval(fadeInterval);
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [addToTrail]);

    return (
        <>
            {/* Trail particles */}
            <AnimatePresence>
                {trail.map((point, index) => {
                    const progress = index / trail.length;
                    const size = 4 + progress * 8;
                    const opacity = 0.3 + progress * 0.5;

                    return (
                        <motion.div
                            key={point.id}
                            className="fixed pointer-events-none z-[9997]"
                            style={{
                                left: point.x,
                                top: point.y,
                                width: size,
                                height: size,
                                borderRadius: "50%",
                                background: `hsl(${160 + index * 5} 84% ${50 + index * 2}%)`,
                                transform: "translate(-50%, -50%)",
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    );
                })}
            </AnimatePresence>

            {/* Main cursor - Hexagon shape */}
            <motion.div
                className="fixed pointer-events-none z-[9999]"
                style={{
                    left: mousePosition.x,
                    top: mousePosition.y,
                }}
                animate={{
                    scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
                    rotate: isHovering ? 45 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
                {/* Inner diamond */}
                <div
                    className="absolute"
                    style={{
                        width: 12,
                        height: 12,
                        background: "hsl(var(--primary))",
                        transform: "translate(-50%, -50%) rotate(45deg)",
                        boxShadow: "0 0 15px hsl(var(--primary) / 0.7), 0 0 30px hsl(var(--primary) / 0.4)",
                    }}
                />
            </motion.div>

            {/* Orbiting dot */}
            <motion.div
                className="fixed pointer-events-none z-[9998]"
                style={{
                    left: mousePosition.x,
                    top: mousePosition.y,
                }}
                animate={{
                    rotate: 360,
                }}
                transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "hsl(var(--accent))",
                        transform: "translate(-50%, -50%) translateX(18px)",
                        boxShadow: "0 0 10px hsl(var(--accent) / 0.8)",
                    }}
                />
            </motion.div>

            {/* Click ripple effect */}
            {isClicking && (
                <motion.div
                    className="fixed pointer-events-none z-[9996]"
                    style={{
                        left: mousePosition.x,
                        top: mousePosition.y,
                        transform: "translate(-50%, -50%)",
                    }}
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: 60, height: 60, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            border: "2px solid hsl(var(--primary))",
                        }}
                    />
                </motion.div>
            )}
        </>
    );
};

export default CustomCursor;
