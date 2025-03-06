"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { PhoneOff, Volume2, VolumeX } from "lucide-react";

interface CallModalProps {
  isCallActive: boolean;
  callHistory: string[];
  voiceWaveform: number[];
  isListening: boolean;
  transcript: string;
  endCall: () => void;
  audioMuted: boolean;
  toggleMute: () => void;
}

const CallModal: React.FC<CallModalProps> = ({
  isCallActive,
  callHistory,
  voiceWaveform,
  isListening,
  transcript,
  endCall,
  audioMuted,
  toggleMute,
}) => {
  // Calculate average waveform height for wave intensity
  const averageWaveformHeight =
    voiceWaveform.reduce((a, b) => a + b, 0) / voiceWaveform.length || 0;

  // Calculate audio intensity for reactive animations
  const audioIntensity = Math.min(averageWaveformHeight / 50, 1);

  // Canvas ref for drawing the waveform
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation frame reference
  const animationFrameRef = useRef<number>(0);

  // Previous waveform data for smooth transitions
  const prevWaveformRef = useRef<number[]>([]);

  // Draw the audio waveform visualization
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Smooth transition between waveform states
    const smoothWaveform = voiceWaveform.map((value, index) => {
      const prev = prevWaveformRef.current[index] || 0;
      return prev + (value - prev) * 0.3;
    });

    prevWaveformRef.current = smoothWaveform;

    // Animation function
    const animate = () => {
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw horizontal center line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 0, 128, 0.5)";
      ctx.lineWidth = 1;
      ctx.moveTo(0, rect.height / 2);
      ctx.lineTo(rect.width, rect.height / 2);
      ctx.stroke();

      // Draw waveform
      const centerY = rect.height / 2;
      const segmentWidth = rect.width / (smoothWaveform.length - 1);

      // Create gradient for the waveform
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
      gradient.addColorStop(0, "rgba(255, 0, 128, 0.8)");
      gradient.addColorStop(0.5, "rgba(255, 255, 0, 0.8)");
      gradient.addColorStop(1, "rgba(255, 0, 128, 0.8)");

      // Draw the main waveform path
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let i = 0; i < smoothWaveform.length; i++) {
        const x = i * segmentWidth;
        const amplitude = isListening
          ? smoothWaveform[i] * (rect.height / 2) * 0.8 * (1 + audioIntensity)
          : smoothWaveform[i] * (rect.height / 2) * 0.4;
        const y = centerY - amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use quadratic curves for smoother waveform
          const prevX = (i - 1) * segmentWidth;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(
            cpX,
            centerY -
              smoothWaveform[i - 1] *
                (rect.height / 2) *
                0.8 *
                (1 + audioIntensity),
            x,
            y
          );
        }
      }

      // Complete the path back to center line
      for (let i = smoothWaveform.length - 1; i >= 0; i--) {
        const x = i * segmentWidth;
        const amplitude = isListening
          ? smoothWaveform[i] * (rect.height / 2) * 0.8 * (1 + audioIntensity)
          : smoothWaveform[i] * (rect.height / 2) * 0.4;
        const y = centerY + amplitude;

        if (i === smoothWaveform.length - 1) {
          ctx.lineTo(x, y);
        } else {
          // Use quadratic curves for smoother waveform
          const prevX = (i + 1) * segmentWidth;
          const cpX = (prevX + x) / 2;
          ctx.quadraticCurveTo(
            cpX,
            centerY +
              smoothWaveform[i + 1] *
                (rect.height / 2) *
                0.8 *
                (1 + audioIntensity),
            x,
            y
          );
        }
      }

      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add glow effect
      ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
      ctx.shadowBlur = 15 * (1 + audioIntensity);
      ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw flame-like effect on peaks
      for (let i = 1; i < smoothWaveform.length - 1; i++) {
        // Only draw flames on significant peaks
        if (
          smoothWaveform[i] > 0.5 &&
          smoothWaveform[i] > smoothWaveform[i - 1] &&
          smoothWaveform[i] > smoothWaveform[i + 1]
        ) {
          const x = i * segmentWidth;
          const peakHeight =
            smoothWaveform[i] * (rect.height / 2) * 0.8 * (1 + audioIntensity);
          const flameHeight = peakHeight * 1.5 * (isListening ? 1 : 0.5);

          // Create flame gradient
          const flameGradient = ctx.createLinearGradient(
            x,
            centerY - peakHeight,
            x,
            centerY - flameHeight
          );
          flameGradient.addColorStop(0, "rgba(255, 255, 0, 0.9)");
          flameGradient.addColorStop(0.5, "rgba(255, 165, 0, 0.7)");
          flameGradient.addColorStop(1, "rgba(255, 0, 0, 0)");

          // Draw flame
          ctx.beginPath();
          ctx.moveTo(x - 5, centerY - peakHeight);
          ctx.quadraticCurveTo(
            x,
            centerY - flameHeight,
            x + 5,
            centerY - peakHeight
          );
          ctx.fillStyle = flameGradient;
          ctx.fill();

          // Add glow to flame
          ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
          ctx.shadowBlur = 20 * (1 + audioIntensity);
        }
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [voiceWaveform, isListening, audioIntensity]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-xl shadow-2xl max-w-md w-full mx-auto overflow-hidden border border-gray-800">
        <div className="p-4 md:p-6 flex flex-col items-center">
          <div
            className="w-full h-48 md:h-56 flex items-center justify-center my-4 relative overflow-hidden rounded-lg"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(20,20,30,1) 100%)",
            }}
          >
            {/* Audio Waveform Visualization */}
            <canvas
              ref={canvasRef}
              className="w-full h-full absolute inset-0"
              style={{
                filter: `blur(${isListening ? 1 : 2}px)`,
                transition: "filter 0.3s ease",
              }}
            />

            {/* Overlay glow effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%)`,
                mixBlendMode: "overlay",
              }}
            />
          </div>

          <div className="w-full max-h-40 md:max-h-60 overflow-y-auto my-3 md:my-4 px-3 md:px-4 rounded-lg bg-black/50">
            {callHistory.map((message, index) => (
              <div
                key={index}
                className={`py-2 text-sm ${
                  message.startsWith("You:")
                    ? "text-right text-cyan-400"
                    : "text-left text-gray-300"
                }`}
              >
                {message}
              </div>
            ))}
          </div>

          <div className="text-center my-3 md:my-4">
            {isCallActive ? (
              <p className="text-xs md:text-sm text-gray-400">
                {transcript ? transcript : "Listening...speak now"}
              </p>
            ) : (
              <p className="text-xs md:text-sm text-gray-400">Connecting...</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors flex items-center justify-center relative overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 transition-opacity duration-300 ${
                  audioMuted ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  transform: `scale(${1 + audioIntensity * 0.5})`,
                  transition: "transform 0.3s ease, opacity 0.3s ease",
                }}
              />
              {audioMuted ? (
                <VolumeX className="h-5 w-5 md:h-6 md:w-6 relative z-10" />
              ) : (
                <Volume2 className="h-5 w-5 md:h-6 md:w-6 relative z-10" />
              )}
            </button>

            <button
              onClick={endCall}
              className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center"
            >
              <PhoneOff className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
