// Face Authentication Utilities with Liveness Detection
import * as faceapi from 'face-api.js';
import { db } from './firebase';
import { ref, get, set, push, remove, update } from 'firebase/database';

// Types
export interface FaceLogin {
    id: string;
    username: string;
    email?: string;
    password?: string;
    faceDescriptor: number[] | null;
    createdAt: number;
    lastLogin: number | null;
    hasFaceRegistered: boolean;
    isActive: boolean;
}

export interface AuthResult {
    success: boolean;
    login?: FaceLogin;
    message: string;
}

// Model loading state
let modelsLoaded = false;

// Load face-api.js models
export const loadFaceModels = async (): Promise<boolean> => {
    if (modelsLoaded) return true;

    try {
        const MODEL_URL = '/models';
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        modelsLoaded = true;
        console.log('Face models loaded successfully');
        return true;
    } catch (error) {
        console.error('Error loading face models:', error);
        return false;
    }
};

// Check if models are loaded
export const areModelsLoaded = (): boolean => modelsLoaded;

// ==================== LIVENESS DETECTION ====================

// Eye Aspect Ratio (EAR) calculation for blink detection
// Uses 6 eye landmark points to calculate how "open" an eye is
export const calculateEAR = (eye: faceapi.Point[]): number => {
    if (eye.length < 6) return 0;

    // Vertical distances
    const v1 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2));
    const v2 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2));

    // Horizontal distance
    const h = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2));

    // EAR formula
    return (v1 + v2) / (2.0 * h);
};

// Get left and right eye landmarks from 68-point face landmarks
export const getEyeLandmarks = (landmarks: faceapi.FaceLandmarks68) => {
    const positions = landmarks.positions;

    // Left eye: points 36-41 (indices)
    const leftEye = positions.slice(36, 42);

    // Right eye: points 42-47 (indices)
    const rightEye = positions.slice(42, 48);

    return { leftEye, rightEye };
};

// Calculate average EAR from both eyes
export const getAverageEAR = (landmarks: faceapi.FaceLandmarks68): number => {
    const { leftEye, rightEye } = getEyeLandmarks(landmarks);
    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);
    return (leftEAR + rightEAR) / 2;
};

// Thresholds for eye state detection
export const EAR_THRESHOLD_CLOSED = 0.18;  // Below this = eyes closed
export const EAR_THRESHOLD_OPEN = 0.27;    // Above this = eyes fully open

// Check if eyes are open
export const isEyesOpen = (ear: number): boolean => ear > EAR_THRESHOLD_OPEN;

// Check if eyes are closed
export const isEyesClosed = (ear: number): boolean => ear < EAR_THRESHOLD_CLOSED;

// Blink detection - detects transition from open → closed → open
export class BlinkDetector {
    private earHistory: number[] = [];
    private blinkDetected: boolean = false;
    private wasOpen: boolean = false;
    private wasClosed: boolean = false;

    reset() {
        this.earHistory = [];
        this.blinkDetected = false;
        this.wasOpen = false;
        this.wasClosed = false;
    }

    update(ear: number): boolean {
        this.earHistory.push(ear);

        // Keep only last 30 readings (~1 second at 30fps)
        if (this.earHistory.length > 30) {
            this.earHistory.shift();
        }

        // State machine for blink detection
        if (!this.wasOpen && isEyesOpen(ear)) {
            this.wasOpen = true;
        } else if (this.wasOpen && !this.wasClosed && isEyesClosed(ear)) {
            this.wasClosed = true;
        } else if (this.wasOpen && this.wasClosed && isEyesOpen(ear)) {
            this.blinkDetected = true;
        }

        return this.blinkDetected;
    }

    hasBlinkDetected(): boolean {
        return this.blinkDetected;
    }
}

// ==================== FACE DETECTION & RECOGNITION ====================

// Detect face with landmarks from video element
export const detectFaceWithLandmarks = async (
    videoEl: HTMLVideoElement
): Promise<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68> | undefined> => {
    const detection = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

    return detection;
};

// Get face descriptor (128D vector) from video
export const getFaceDescriptor = async (
    videoEl: HTMLVideoElement
): Promise<Float32Array | null> => {
    const detection = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) return null;
    return detection.descriptor;
};

// Compare two face descriptors (Euclidean distance)
export const compareFaces = (desc1: Float32Array, desc2: number[]): number => {
    const desc2Array = new Float32Array(desc2);
    return faceapi.euclideanDistance(desc1, desc2Array);
};

// Check if face matches (lower distance = better match)
// Threshold 0.45 = ~75% confidence match
export const FACE_MATCH_THRESHOLD = 0.45;

export const isFaceMatch = (distance: number): boolean => {
    return distance < FACE_MATCH_THRESHOLD;
};

// ==================== FIREBASE CRUD ====================

const LOGINS_PATH = 'admin/logins';

// Sync existing admin user to face logins (if not already there)
const syncExistingAdminToFaceLogins = async (): Promise<void> => {
    try {
        // Check if there's an existing admin user
        const adminUserRef = ref(db, 'admin/user');
        const adminSnapshot = await get(adminUserRef);

        if (!adminSnapshot.exists()) return;

        const adminUser = adminSnapshot.val();
        const adminUsername = adminUser.username;

        // Check if this admin already has a face login
        const loginsRef = ref(db, LOGINS_PATH);
        const loginsSnapshot = await get(loginsRef);

        if (loginsSnapshot.exists()) {
            const logins = loginsSnapshot.val();
            const existingLogin = Object.values(logins).find((login: any) =>
                login.username === adminUsername
            );
            if (existingLogin) return; // Already exists
        }

        // Create face login for existing admin
        const newLoginRef = push(loginsRef);
        await set(newLoginRef, {
            username: adminUsername,
            faceDescriptor: null,
            createdAt: adminUser.createdAt || Date.now(),
            lastLogin: null,
            hasFaceRegistered: false,
            isActive: true,
            isMainAdmin: true, // Mark as main admin
        });

        console.log(`Created face login entry for existing admin: ${adminUsername}`);
    } catch (error) {
        console.error('Error syncing admin to face logins:', error);
    }
};

// Get all face logins from Firebase
export const getFaceLogins = async (): Promise<FaceLogin[]> => {
    try {
        // First, ensure existing admin is synced
        await syncExistingAdminToFaceLogins();

        const loginsRef = ref(db, LOGINS_PATH);
        const snapshot = await get(loginsRef);

        if (!snapshot.exists()) return [];

        const data = snapshot.val();
        return Object.entries(data).map(([id, login]: [string, any]) => ({
            id,
            ...login,
            isActive: login.isActive !== false, // Default to true
        }));
    } catch (error) {
        console.error('Error getting face logins:', error);
        return [];
    }
};

// Create new face login
export const createFaceLogin = async (
    username: string,
    email?: string,
    password?: string
): Promise<string | null> => {
    try {
        const loginsRef = ref(db, LOGINS_PATH);
        const newLoginRef = push(loginsRef);

        const newLogin = {
            username,
            email: email || '',
            password: password || '',
            faceDescriptor: null,
            createdAt: Date.now(),
            lastLogin: null,
            hasFaceRegistered: false,
            isActive: true,
        };

        await set(newLoginRef, newLogin);
        return newLoginRef.key;
    } catch (error) {
        console.error('Error creating face login:', error);
        return null;
    }
};

// Update face descriptor for a login
export const updateFaceDescriptor = async (
    loginId: string,
    descriptor: number[]
): Promise<boolean> => {
    try {
        const loginRef = ref(db, `${LOGINS_PATH}/${loginId}`);
        await update(loginRef, {
            faceDescriptor: descriptor,
            hasFaceRegistered: true,
        });
        return true;
    } catch (error) {
        console.error('Error updating face descriptor:', error);
        return false;
    }
};

// Update login active status
export const updateLoginActiveStatus = async (
    loginId: string,
    isActive: boolean
): Promise<boolean> => {
    try {
        const loginRef = ref(db, `${LOGINS_PATH}/${loginId}`);
        await update(loginRef, { isActive });
        return true;
    } catch (error) {
        console.error('Error updating login status:', error);
        return false;
    }
};

// Delete face login
export const deleteFaceLogin = async (loginId: string): Promise<boolean> => {
    try {
        const loginRef = ref(db, `${LOGINS_PATH}/${loginId}`);
        await remove(loginRef);
        return true;
    } catch (error) {
        console.error('Error deleting face login:', error);
        return false;
    }
};

// Authenticate by face - compare detected face with all active logins
export const authenticateByFace = async (
    detectedDescriptor: Float32Array
): Promise<AuthResult> => {
    try {
        const logins = await getFaceLogins();

        // Filter to only active logins with registered faces
        const activeLogins = logins.filter(
            login => login.isActive && login.hasFaceRegistered && login.faceDescriptor
        );

        if (activeLogins.length === 0) {
            return {
                success: false,
                message: 'No registered faces found. Please use password login.',
            };
        }

        // Find best match
        let bestMatch: FaceLogin | null = null;
        let bestDistance = Infinity;

        for (const login of activeLogins) {
            if (!login.faceDescriptor) continue;

            const distance = compareFaces(detectedDescriptor, login.faceDescriptor);

            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = login;
            }
        }

        if (bestMatch && isFaceMatch(bestDistance)) {
            // Update last login time
            const loginRef = ref(db, `${LOGINS_PATH}/${bestMatch.id}`);
            await update(loginRef, { lastLogin: Date.now() });

            return {
                success: true,
                login: bestMatch,
                message: `Welcome, ${bestMatch.username}!`,
            };
        }

        return {
            success: false,
            message: 'Face not recognized. Please try again.',
        };
    } catch (error) {
        console.error('Error authenticating by face:', error);
        return {
            success: false,
            message: 'Authentication error. Please try password login.',
        };
    }
};
