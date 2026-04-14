"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, CameraOff, RefreshCw, Loader2 } from "lucide-react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { EmotionScores } from "@/types";

interface FaceCaptureProps {
  onFrame?: (blob: Blob, emotions?: EmotionScores) => void;
  captureIntervalMs?: number;
}

export default function FaceCapture({
  onFrame,
  captureIntervalMs = 5000,
}: FaceCaptureProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    async function initMediaPipe() {
      if (faceLandmarkerRef.current) return;
      setIsInitializing(true);
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
          numFaces: 1,
        });
        faceLandmarkerRef.current = landmarker;
      } catch (err) {
        console.error("Failed to initialize MediaPipe Face Landmarker:", err);
        setError("Face detection initialization failed.");
      } finally {
        setIsInitializing(false);
      }
    }
    initMediaPipe();
  }, []);

  const detectEmotions = useCallback((videoElement: HTMLVideoElement): EmotionScores => {
    if (!faceLandmarkerRef.current || videoElement.readyState < 3 || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        return { neutral: 1, happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0 };
    }

    try {
        const result = faceLandmarkerRef.current.detect(videoElement);
        if (!result.faceBlendshapes || result.faceBlendshapes.length === 0) {
            return { neutral: 1, happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0 };
        }

        const blendshapes = result.faceBlendshapes[0].categories;
        const findScore = (name: string) => blendshapes.find((c) => c.categoryName === name)?.score || 0;

        // Simplified mapping from blendshapes to basic emotions
        const happy = (findScore("mouthSmileLeft") + findScore("mouthSmileRight")) / 2;
        const sad = (findScore("mouthFrownLeft") + findScore("mouthFrownRight")) / 2;
        const angry = (findScore("browDownLeft") + findScore("browDownRight")) / 2;
        const surprised = (findScore("eyeWideLeft") + findScore("eyeWideRight")) / 2;
        const fearful = findScore("browInnerUp"); // Rough approximation

        const maxEmotion = Math.max(happy, sad, angry, surprised, fearful);
        let neutral = 1 - maxEmotion;
        if (neutral < 0) neutral = 0;

        return { neutral, happy, sad, angry, surprised, fearful };
    } catch (err) {
        console.error("MediaPipe detection error:", err);
        return { neutral: 1, happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0 };
    }
  }, []);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    
    // Detect emotions using MediaPipe
    const emotions = detectEmotions(video);

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) onFrame?.(blob, emotions);
      },
      "image/jpeg",
      0.8
    );
  }, [onFrame, detectEmotions]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
      setHasPermission(true);

      // Periodic frame capture for analysis
      if (onFrame) {
        intervalRef.current = setInterval(() => {
          captureFrame();
        }, captureIntervalMs);
      }
    } catch {
      setError("Camera access denied.");
      setHasPermission(false);
    }
  }, [onFrame, captureIntervalMs, captureFrame]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Face Analysis
          </span>
        </div>
        <button
          onClick={isActive ? stopCamera : startCamera}
          disabled={isInitializing}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
            isActive
              ? "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20"
              : "bg-accent-muted text-accent border border-accent/20 hover:bg-accent/20"
          } ${isInitializing ? "opacity-50 cursor-not-allowed" : ""}`}
          id="face-capture-toggle"
        >
          {isInitializing ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Initializing...
            </span>
          ) : isActive ? (
            <span className="flex items-center gap-1.5">
              <CameraOff className="w-3 h-3" />
              Stop
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Camera className="w-3 h-3" />
              Start
            </span>
          )}
        </button>
      </div>

      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface border border-surface-border">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              id="face-capture-video"
            />
            {/* Scan overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent/60 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent/60 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent/60 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent/60 rounded-br-lg" />
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-white/80 font-mono">LIVE ANALYSIS</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            {error ? (
              <>
                <CameraOff className="w-8 h-8 opacity-40" />
                <p className="text-xs text-center px-4">{error}</p>
                <button
                  onClick={startCamera}
                  className="text-xs text-accent flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </>
            ) : isInitializing ? (
               <>
                <Loader2 className="w-8 h-8 opacity-40 animate-spin" />
                <p className="text-xs">Loading AI Models...</p>
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 opacity-20" />
                <p className="text-xs opacity-60">
                  {hasPermission === null
                    ? "Click Start to enable camera"
                    : "Camera inactive"}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
