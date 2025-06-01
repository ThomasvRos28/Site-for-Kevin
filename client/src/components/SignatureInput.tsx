import React, { useRef, useState, useEffect, useCallback } from 'react'
import './SignatureInput.css'

interface SignatureInputProps {
  onSubmit: (signatureData: string) => void
  label?: string
  placeholder?: string
}

interface Point {
  x: number
  y: number
}

const SignatureInput: React.FC<SignatureInputProps> = ({
  onSubmit,
  label = "Signature",
  placeholder = "Click to add signature"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isModalOpen && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Set canvas size to fill the container
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        
        // Set drawing styles
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [isModalOpen])

  const getEventPoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }, [])

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const point = getEventPoint(e)
    setLastPoint(point)
  }, [getEventPoint])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !canvasRef.current || !lastPoint) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const currentPoint = getEventPoint(e)
    
    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()
    
    setLastPoint(currentPoint)
    setHasSignature(true)
  }, [isDrawing, lastPoint, getEventPoint])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    setLastPoint(null)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }, [])

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    // Convert canvas to base64 image
    const dataURL = canvas.toDataURL('image/png')
    setSignaturePreview(dataURL)
    onSubmit(dataURL)
    setIsModalOpen(false)
  }, [hasSignature, onSubmit])

  const handleCancel = useCallback(() => {
    setIsModalOpen(false)
    clearCanvas()
  }, [clearCanvas])

  const openModal = () => {
    setIsModalOpen(true)
  }

  const removeSignature = () => {
    setSignaturePreview(null)
    setHasSignature(false)
  }

  return (
    <div className="signature-input">
      <label className="signature-label">{label}:</label>
      
      {signaturePreview ? (
        <div className="signature-preview">
          <img src={signaturePreview} alt="Signature" className="signature-image" />
          <div className="signature-actions">
            <button type="button" onClick={openModal} className="edit-signature-btn">
              Edit Signature
            </button>
            <button type="button" onClick={removeSignature} className="remove-signature-btn">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={openModal} className="add-signature-btn">
          📝 {placeholder}
        </button>
      )}

      {isModalOpen && (
        <div className="signature-modal-overlay">
          <div className="signature-modal">
            <div className="signature-modal-header">
              <h3>Add Your Signature</h3>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="close-modal-btn"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="signature-canvas-container">
              <canvas
                ref={canvasRef}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="signature-instructions">
                Draw your signature above
              </div>
            </div>
            
            <div className="signature-modal-actions">
              <button 
                type="button" 
                onClick={clearCanvas} 
                className="retry-btn"
              >
                🔄 Retry
              </button>
              <button 
                type="button" 
                onClick={handleSubmit} 
                className="submit-signature-btn"
                disabled={!hasSignature}
              >
                ✓ Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignatureInput
