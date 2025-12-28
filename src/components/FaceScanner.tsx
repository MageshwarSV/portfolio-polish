// Face Scanner Component with Liveness Detection
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    loadFaceModels,
    areModelsLoaded,
    detectFaceWithLandmarks,
    getFaceDescriptor,
    getAverageEAR,
    isEyesOpen,
    BlinkDetector,
} from '@/lib/faceAuth';
import { Camera, X, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

interface FaceScannerProps {
    mode: 'register' | 'authenticate';
    onSuccess: (descriptor: Float32Array) => void;
    onValidate?: (descriptor: Float32Array) => Promise<{ success: boolean; message?: string }>;
    onError: (error: string) => void;
    onCancel: () => void;
    maxAttempts?: number;
}

type ScanState =
    | 'loading'       // Loading models
    | 'ready'         // Ready to start
    | 'detecting'     // Looking for face & open eyes
    | 'capturing'     // Final: Waiting for eyes open & capture
    | 'validating'    // Checking descriptor against DB
    | 'success'       // Success
    | 'error';        // Error


const FaceScanner = ({
    mode,
    onSuccess,
    onValidate,
    onError,
    onCancel,
    maxAttempts = 3,
}: FaceScannerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const blinkDetectorRef = useRef(new BlinkDetector());
    const stepFrameCount = useRef(0); // Track frames for current step stability

    // Audio context ref to persist across renders and avoid policy blocking if possible
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize audio context
    useEffect(() => {
        const initAudio = () => {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    audioContextRef.current = new AudioContextClass();
                }
            } catch (e) {
                console.error('Audio init failed', e);
            }
        };
        initAudio();

        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    // Play sound helper using the persistent ref
    const playScanSound = useCallback((type: 'success' | 'step') => {
        try {
            // Haptic feedback for mobile
            if (navigator.vibrate) navigator.vibrate(200);

            const ctx = audioContextRef.current;
            if (!ctx) return;

            // Attempt to resume if suspended (common browser policy)
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => { });
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'success') {
                // Success chime (High-Low-High)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } else {
                // Step completion beep (Single high blip)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            }
        } catch (e) {
            console.error('Audio playback failed', e);
        }
    }, []);

    const [state, setState] = useState<ScanState>('loading');
    const [message, setMessage] = useState('Loading face detection...');
    const [attempts, setAttempts] = useState(0);
    const [earValue, setEarValue] = useState(0);
    const [faceDetected, setFaceDetected] = useState(false);
    const [scanProgress, setScanProgress] = useState(0); // 0-100
    const [faceLostCount, setFaceLostCount] = useState(0); // Tolerance for brief face loss

    // Initialize models and camera
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            // Load models
            const loaded = await loadFaceModels();
            if (!loaded || !mounted) {
                onError('Failed to load face detection models');
                return;
            }

            // Start camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                    },
                });

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                setState('detecting');
                setMessage('Position your face in the frame');
            } catch (error) {
                console.error('Camera error:', error);
                onError('Camera access denied. Please allow camera permissions.');
            }
        };

        init();

        return () => {
            mounted = false;
            stopCamera();
        };
    }, []);

    // Stop camera stream
    const stopCamera = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }, []);

    // Face detection loop
    useEffect(() => {
        if (state !== 'detecting' && state !== 'capturing') return;

        const detectLoop = async () => {
            // ... existing setup code ...
            if (!videoRef.current || !canvasRef.current) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (!ctx || video.readyState !== 4) {
                animationRef.current = requestAnimationFrame(detectLoop);
                return;
            }

            // Set canvas size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Detect face with landmarks
            const detection = await detectFaceWithLandmarks(video);

            // Clear and draw video
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detection) {
                const ear = getAverageEAR(detection.landmarks);
                setEarValue(ear);
                setFaceDetected(true);
                setFaceLostCount(0); // Reset tolerance counter

                // Draw Circular Progress UI
                const box = detection.detection.box;
                const centerX = box.x + box.width / 2;
                const centerY = box.y + box.height / 2;
                const radius = Math.max(box.width, box.height) / 1.5;

                // Draw background circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 4;
                ctx.stroke();

                // Draw progress arc
                const startAngle = -Math.PI / 2; // Start from top
                const endAngle = startAngle + (2 * Math.PI * (scanProgress / 100));

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.strokeStyle = (scanProgress >= 100 || state === 'capturing') ? '#10b981' : '#3b82f6'; // Green if success/capturing, Blue otherwise
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw percentage or status text
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (scanProgress >= 100 || state === 'capturing') {
                    ctx.fillText('SAVED', centerX, centerY + radius + 25);
                } else if (scanProgress > 0) {
                    ctx.fillText(`${Math.round(scanProgress)}%`, centerX, centerY + radius + 25);
                }

                // Debug EAR value
                ctx.font = '10px monospace';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText(`Openness: ${ear.toFixed(2)}`, centerX, centerY + radius + 45);



                // --- STEP 1: VERIFY OPEN EYES ---
                if (state === 'detecting') {
                    if (isEyesOpen(ear)) {
                        stepFrameCount.current++;
                        if (stepFrameCount.current > 15) { // Stable for ~15 frames (0.5s)
                            playScanSound('step');
                            setState('capturing');
                            setMessage('Perfect! Hold still...');
                            setScanProgress(66);
                            stepFrameCount.current = 0;
                        } else {
                            // Progress bar from 0 to 66 based on stability
                            setScanProgress(Math.min(66, (stepFrameCount.current / 15) * 66));
                        }
                    } else {
                        // Soft reset
                        stepFrameCount.current = Math.max(0, stepFrameCount.current - 2);
                        setMessage('Please open your eyes FULLY');
                        // Don't reset progress to 0 rapidly, let it drift down
                        setScanProgress(Math.max(0, (stepFrameCount.current / 15) * 66));
                    }
                }

                // --- STEP 2: CAPTURE ---
                if (state === 'capturing') {
                    if (isEyesOpen(ear)) {
                        stepFrameCount.current++;
                        if (stepFrameCount.current > 5) { // Extra stability
                            setScanProgress(100);
                            playScanSound('success');
                            setMessage('Verifying complete!');
                            await captureDescriptor();
                            return; // Stop loop
                        } else {
                            // Progress from 66 to 100
                            setScanProgress(66 + (stepFrameCount.current / 5) * 34);
                        }
                    } else {
                        // If eyes close during capture, go back to detecting
                        setState('detecting');
                        stepFrameCount.current = 0;
                        setMessage('Eyes closed. Restarting...');
                    }
                }

            } else {
                setFaceDetected(false);
                // Allow brief face loss (5 frames tolerance) - mainly relevant during transitions
                if (state === 'detecting' || state === 'capturing') {
                    setFaceLostCount(prev => prev + 1);
                    if (faceLostCount > 10) {
                        // Reset if face lost for too long
                        setState('detecting');
                        setMessage('Face lost. Restarting...');
                        setScanProgress(0);
                        setFaceLostCount(0);
                        stepFrameCount.current = 0;
                    }
                }
            }

            animationRef.current = requestAnimationFrame(detectLoop);
        };

        detectLoop();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [state]);

    // Capture face descriptor
    const captureDescriptor = async () => {
        console.log('captureDescriptor called');
        if (!videoRef.current) return;

        // Pause detection
        setState('validating');
        setMessage('Verifying face...');

        const descriptor = await getFaceDescriptor(videoRef.current);

        if (descriptor) {
            // If validation function provided, verify first
            if (onValidate) {
                try {
                    const result = await onValidate(descriptor);

                    if (result.success) {
                        setState('success');
                        setMessage(result.message || 'Face matched!');
                        playScanSound('success');
                        stopCamera();
                        setTimeout(() => onSuccess(descriptor), 1000);
                    } else {
                        // Verification failed
                        setState('error');
                        setMessage(result.message || 'Face does not match');
                        // Show red error state for 1.5s then retry
                        setTimeout(() => {
                            handleAttemptFailed(result.message || 'Face does not match');
                        }, 1500);
                    }
                } catch (error) {
                    console.error('Validation error:', error);
                    handleAttemptFailed('Verification error occurred');
                }
            } else {
                // Classic success flow (Registration mode usually)
                setState('success');
                setMessage('Face captured successfully!');
                playScanSound('success');
                stopCamera();
                setTimeout(() => onSuccess(descriptor), 1000);
            }
        } else {
            handleAttemptFailed('Could not capture face. Please try again.');
        }
    };

    // Handle failed attempt
    const handleAttemptFailed = (msg: string) => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
            setState('error');
            setMessage('Too many failed attempts');
            stopCamera();
            onError(`Maximum attempts (${maxAttempts}) reached. Please use password login.`);
        } else {
            setState('detecting'); // Reset to start
            setMessage(`${msg} (${maxAttempts - newAttempts} attempts left)`);
            setScanProgress(0);
            setFaceDetected(false);
            stepFrameCount.current = 0;
        }
    };

    // Handle cancel
    const handleCancel = () => {
        stopCamera();
        onCancel();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg mx-4 bg-card rounded-2xl overflow-hidden border border-border shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Camera className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">
                                {mode === 'register' ? 'Register Face' : 'Face Login'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {mode === 'register' ? 'Blink to verify liveness' : 'Look at the camera'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Video Container */}
                <div className="relative aspect-[4/3] bg-black">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover transform scale-x-[-1]"
                        playsInline
                        muted
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                    />

                    {/* Overlay for loading state */}
                    <AnimatePresence>
                        {state === 'loading' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/60"
                            >
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success overlay */}
                    <AnimatePresence>
                        {state === 'success' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="p-4 bg-green-500 rounded-full"
                                >
                                    <Check className="w-12 h-12 text-white" />
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Error overlay */}
                        {state === 'error' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-red-500/20"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="p-4 bg-red-500 rounded-full"
                                >
                                    <X className="w-12 h-12 text-white" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Face detection indicator - simplified, no EAR shown */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-black/50 rounded-lg">
                        {faceDetected ? (
                            <>
                                {isEyesOpen(earValue) ? (
                                    <Eye className="w-4 h-4 text-green-400" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-yellow-400" />
                                )}
                                <span className="text-xs text-white font-medium">
                                    {isEyesOpen(earValue) ? 'Eyes Open' : 'Eyes Closed'}
                                </span>
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground">Searching for face...</span>
                        )}
                    </div>

                    {/* Blink/Step indicator removed - using main message */}
                </div>

                {/* Footer with status */}
                <div className="px-6 py-4 border-t border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        {state === 'loading' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                        {state === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                        {state === 'success' && <Check className="w-5 h-5 text-green-500" />}
                        {(state === 'detecting' || state === 'capturing') && (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                        <span className={`text-sm ${state === 'error' ? 'text-red-500' : 'text-foreground'}`}>
                            {message}
                        </span>
                    </div>

                    {/* Attempt counter */}
                    {attempts > 0 && state !== 'success' && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Attempts: {attempts}/{maxAttempts}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default FaceScanner;
