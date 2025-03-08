"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { PhoneOff, Volume2, VolumeX } from "lucide-react"

interface CallModalProps {
  isCallActive: boolean
  callHistory: string[]
  voiceWaveform: number[]
  isListening: boolean
  transcript: string
  endCall: () => void
  audioMuted: boolean
  toggleMute: () => void
}

// Frequency bands interface for type safety
interface FrequencyBands {
  low: number
  mid: number
  high: number
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
  const [isAISpeaking, setIsAISpeaking] = useState(false)

  // Calculate average waveform height for wave intensity
  const averageWaveformHeight = voiceWaveform.reduce((a, b) => a + b, 0) / voiceWaveform.length || 0

  // Calculate audio intensity for reactive animations
  const audioIntensity = Math.min(averageWaveformHeight / 50, 1)

  // Canvas ref for drawing the waveform
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animation frame reference
  const animationFrameRef = useRef<number>(0)

  // Previous waveform data for smooth transitions
  const prevWaveformRef = useRef<number[]>([])

  // Effect to handle AI speaking state
  useEffect(() => {
    if (isAISpeaking) {
      // Mute the microphone when AI is speaking
      if (!audioMuted) {
        toggleMute()
      }
    } else {
      // Unmute the microphone when AI is not speaking
      if (audioMuted) {
        toggleMute()
      }
    }
  }, [isAISpeaking, audioMuted, toggleMute])

  // Draw the audio waveform visualization
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Initialize previous waveform if empty
    if (!prevWaveformRef.current.length) {
      prevWaveformRef.current = Array(voiceWaveform.length).fill(0)
    }

    // Smooth transition between waveform states
    const smoothWaveform = voiceWaveform.map((value, index) => {
      const prev = prevWaveformRef.current[index] || 0
      return prev + (value - prev) * 0.3
    })

    prevWaveformRef.current = smoothWaveform

    // Calculate frequency bands from waveform data
    const frequencyBands: FrequencyBands = {
      low: 0,
      mid: 0,
      high: 0,
    }

    // Divide waveform into frequency bands
    const third = Math.floor(smoothWaveform.length / 3)

    for (let i = 0; i < smoothWaveform.length; i++) {
      if (i < third) {
        frequencyBands.low += smoothWaveform[i]
      } else if (i < third * 2) {
        frequencyBands.mid += smoothWaveform[i]
      } else {
        frequencyBands.high += smoothWaveform[i]
      }
    }

    frequencyBands.low /= third || 1
    frequencyBands.mid /= third || 1
    frequencyBands.high /= third || 1

    // Animation function
    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw waveform
      const centerY = rect.height / 2
      const segmentWidth = rect.width / (smoothWaveform.length - 1)

      // Create gradient for the waveform based on the reference images
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)

      // Colorful spectrum gradient similar to the first reference image
      gradient.addColorStop(0, "rgba(255, 50, 0, 0.8)") // Red/orange
      gradient.addColorStop(0.2, "rgba(255, 200, 0, 0.8)") // Yellow
      gradient.addColorStop(0.4, "rgba(0, 255, 100, 0.8)") // Green
      gradient.addColorStop(0.6, "rgba(0, 200, 255, 0.8)") // Cyan
      gradient.addColorStop(0.8, "rgba(150, 0, 255, 0.8)") // Purple
      gradient.addColorStop(1, "rgba(255, 0, 150, 0.8)") // Pink

      // Calculate time-based phase for wave movement
      const time = Date.now() / 1000
      const phase = time % (Math.PI * 2)

      // Draw the main waveform path
      ctx.beginPath()
      ctx.moveTo(0, centerY)

      for (let i = 0; i < smoothWaveform.length; i++) {
        const x = i * segmentWidth

        // Calculate which frequency band this point belongs to
        let frequencyFactor = 1.0
        if (i < smoothWaveform.length / 3) {
          frequencyFactor = 0.8 + frequencyBands.low * 0.5
        } else if (i < (smoothWaveform.length / 3) * 2) {
          frequencyFactor = 0.8 + frequencyBands.mid * 0.5
        } else {
          frequencyFactor = 0.8 + frequencyBands.high * 0.5
        }

        // Add wave motion based on time
        const waveMotion = Math.sin(phase + i * 0.2) * 0.1

        // Calculate amplitude with intensity scaling
        // This ensures wave height increases with sound intensity
        const baseAmplitude = smoothWaveform[i] * (rect.height / 2)
        const intensityFactor = isListening ? 1 + audioIntensity * 2 : 0.4
        const amplitude = baseAmplitude * frequencyFactor * intensityFactor * (1 + waveMotion)

        const y = centerY - amplitude

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          // Use quadratic curves for smoother waveform
          const prevX = (i - 1) * segmentWidth
          const cpX = (prevX + x) / 2

          // Calculate previous point's amplitude for the control point
          const prevIndex = i - 1
          let prevFrequencyFactor = 1.0

          if (prevIndex < smoothWaveform.length / 3) {
            prevFrequencyFactor = 0.8 + frequencyBands.low * 0.5
          } else if (prevIndex < (smoothWaveform.length / 3) * 2) {
            prevFrequencyFactor = 0.8 + frequencyBands.mid * 0.5
          } else {
            prevFrequencyFactor = 0.8 + frequencyBands.high * 0.5
          }

          const prevWaveMotion = Math.sin(phase + prevIndex * 0.2) * 0.1
          const prevAmplitude =
            smoothWaveform[prevIndex] * (rect.height / 2) * prevFrequencyFactor * intensityFactor * (1 + prevWaveMotion)

          ctx.quadraticCurveTo(cpX, centerY - prevAmplitude, x, y)
        }
      }

      // Complete the path back to center line
      for (let i = smoothWaveform.length - 1; i >= 0; i--) {
        const x = i * segmentWidth

        // Calculate which frequency band this point belongs to
        let frequencyFactor = 1.0
        if (i < smoothWaveform.length / 3) {
          frequencyFactor = 0.8 + frequencyBands.low * 0.5
        } else if (i < (smoothWaveform.length / 3) * 2) {
          frequencyFactor = 0.8 + frequencyBands.mid * 0.5
        } else {
          frequencyFactor = 0.8 + frequencyBands.high * 0.5
        }

        // Add wave motion based on time
        const waveMotion = Math.sin(phase + i * 0.2) * 0.1

        // Calculate amplitude with intensity scaling
        const baseAmplitude = smoothWaveform[i] * (rect.height / 2)
        const intensityFactor = isListening ? 1 + audioIntensity * 2 : 0.4
        const amplitude = baseAmplitude * frequencyFactor * intensityFactor * (1 + waveMotion)

        const y = centerY + amplitude

        if (i === smoothWaveform.length - 1) {
          ctx.lineTo(x, y)
        } else {
          // Use quadratic curves for smoother waveform
          const prevX = (i + 1) * segmentWidth
          const cpX = (prevX + x) / 2

          // Calculate previous point's amplitude for the control point
          const prevIndex = i + 1
          let prevFrequencyFactor = 1.0

          if (prevIndex < smoothWaveform.length / 3) {
            prevFrequencyFactor = 0.8 + frequencyBands.low * 0.5
          } else if (prevIndex < (smoothWaveform.length / 3) * 2) {
            prevFrequencyFactor = 0.8 + frequencyBands.mid * 0.5
          } else {
            prevFrequencyFactor = 0.8 + frequencyBands.high * 0.5
          }

          const prevWaveMotion = Math.sin(phase + prevIndex * 0.2) * 0.1
          const prevAmplitude =
            smoothWaveform[prevIndex] * (rect.height / 2) * prevFrequencyFactor * intensityFactor * (1 + prevWaveMotion)

          ctx.quadraticCurveTo(cpX, centerY + prevAmplitude, x, y)
        }
      }

      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Add glow effect that intensifies with audio level
      const glowIntensity = 15 * (1 + audioIntensity * 2)
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
      ctx.shadowBlur = glowIntensity
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw vertical bars like in the second reference image
      const barWidth = rect.width / 100
      const barSpacing = rect.width / 50

      for (let i = 0; i < rect.width; i += barSpacing) {
        // Calculate bar height based on position and waveform data
        const waveformIndex = Math.floor((i / rect.width) * smoothWaveform.length)
        const barValue = smoothWaveform[waveformIndex] || 0

        // Scale height based on audio intensity
        const barHeight = barValue * rect.height * 0.8 * (1 + audioIntensity)

        // Create gradient for the bar
        const barGradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2)

        // Position-based color (like the spectrum in the first image)
        const position = i / rect.width
        let color1, color2, color3

        if (position < 0.2) {
          color1 = "rgba(255, 0, 0, 0.7)"
          color2 = "rgba(255, 100, 0, 0.9)"
          color3 = "rgba(255, 50, 0, 0.7)"
        } else if (position < 0.4) {
          color1 = "rgba(255, 200, 0, 0.7)"
          color2 = "rgba(255, 255, 0, 0.9)"
          color3 = "rgba(200, 255, 0, 0.7)"
        } else if (position < 0.6) {
          color1 = "rgba(0, 255, 0, 0.7)"
          color2 = "rgba(0, 255, 100, 0.9)"
          color3 = "rgba(0, 200, 100, 0.7)"
        } else if (position < 0.8) {
          color1 = "rgba(0, 200, 255, 0.7)"
          color2 = "rgba(0, 100, 255, 0.9)"
          color3 = "rgba(50, 0, 255, 0.7)"
        } else {
          color1 = "rgba(150, 0, 255, 0.7)"
          color2 = "rgba(200, 0, 200, 0.9)"
          color3 = "rgba(255, 0, 150, 0.7)"
        }

        barGradient.addColorStop(0, color1)
        barGradient.addColorStop(0.5, color2)
        barGradient.addColorStop(1, color3)

        // Draw the bar
        ctx.fillStyle = barGradient
        ctx.fillRect(i, centerY - barHeight / 2, barWidth, barHeight)

        // Add glow to bars
        ctx.shadowColor = color2
        ctx.shadowBlur = 10 * (1 + audioIntensity)
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [voiceWaveform, isListening, audioIntensity])

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-xl shadow-2xl max-w-md w-full mx-auto overflow-hidden border border-gray-800">
        <div className="p-4 md:p-6 flex flex-col items-center">
          <div
            className="w-full h-48 md:h-56 flex items-center justify-center my-4 relative overflow-hidden rounded-lg"
            style={{
              background: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(20,20,30,1) 100%)",
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
                  message.startsWith("You:") ? "text-right text-cyan-400" : "text-left text-gray-300"
                }`}
              >
                {message}
              </div>
            ))}
          </div>

          <div className="text-center my-3 md:my-4">
            {isCallActive ? (
              <p className="text-xs md:text-sm text-gray-400">{transcript ? transcript : "Listening...speak now"}</p>
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
  )
}

export default CallModal