import React, { useRef, useState } from 'react'
import axios from 'axios'

const backendBase = import.meta.env.VITE_BACKEND_BASE || 'http://localhost:4000'
const aiBase = import.meta.env.VITE_AI_BASE || 'http://localhost:5001'

export default function Upload() {
  const fileRef = useRef()
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  async function onUpload(e) {
    e.preventDefault()
    const file = fileRef.current.files?.[0]
    if (!file) {
      setStatus('Please select a certificate file')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Step 1: AI Analysis
      setStatus('🔍 Running AI tamper detection...')
      const aiForm = new FormData()
      aiForm.append('certificate', file)
      const aiRes = await axios.post(`${aiBase}/ai/check`, aiForm)

      // Step 2: Backend Upload & Blockchain Storage
      setStatus('⛓ Storing on blockchain...')
      const form = new FormData()
      form.append('certificate', file)
      const token = localStorage.getItem('idToken')
      const res = await axios.post(`${backendBase}/upload`, form, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      setResult({ ai: aiRes.data, backend: res.data })
      setStatus('✅ Certificate successfully uploaded and verified!')
    } catch (e) {
      setStatus('❌ Error: ' + (e.response?.data?.error || e.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Upload Certificate
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          Upload your certificate for blockchain verification and AI-powered tamper detection
        </p>
      </div>

      <form onSubmit={onUpload} style={{ marginBottom: '30px' }}>
        {/* File Upload Area */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px dashed rgba(102, 126, 234, 0.3)',
          borderRadius: '20px',
          padding: '60px 40px',
          textAlign: 'center',
          marginBottom: '30px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative'
        }}>
          <input
            type="file"
            ref={fileRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.7 }}>📄</div>
          <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '10px' }}>
            Drop your certificate here
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '20px' }}>
            or click to browse files
          </p>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'rgba(102, 126, 234, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem'
          }}>
            Supports JPG, PNG, PDF files
          </div>
        </div>

        {preview && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <img
              src={preview}
              alt="Certificate preview"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '2px solid rgba(102, 126, 234, 0.3)'
              }}
            />
            <div>
              <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Certificate Preview</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>
                ✅ Ready for upload and verification
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '20px 40px',
            background: loading
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 20px 40px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease',
            transform: loading ? 'none' : 'translateY(-2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing...
            </>
          ) : (
            <>🚀 Upload & Verify Certificate</>
          )}
        </button>
      </form>

      {status && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: status.includes('Error') ? '#fee' : status.includes('✅') ? '#efe' : '#eef',
          border: `1px solid ${status.includes('Error') ? '#fcc' : status.includes('✅') ? '#cfc' : '#ccf'}`,
          color: status.includes('Error') ? '#c33' : status.includes('✅') ? '#3c3' : '#33c'
        }}>
          {status}
        </div>
      )}

      {result && (
        <div style={{
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: '#4a5568', marginBottom: '20px' }}>Verification Results</h3>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#4a5568', marginBottom: '10px' }}>🤖 AI Tamper Detection</h4>
            <div style={{
              padding: '15px',
              borderRadius: '8px',
              background: result.ai.tamperLikely ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${result.ai.tamperLikely ? '#ef4444' : '#10b981'}`
            }}>
              <strong>Status:</strong> {result.ai.tamperLikely ? '⚠ Suspicious' : '✅ Clean'}
              {result.ai.confidence && (
                <span> (Confidence: {(result.ai.confidence * 100).toFixed(1)}%)</span>
              )}
              {result.ai.reasons && result.ai.reasons.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Detected Issues:</strong>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {result.ai.reasons.map((reason, i) => (
                      <li key={i} style={{ color: '#666' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#4a5568', marginBottom: '10px' }}>⛓ Blockchain Storage</h4>
            <div style={{
              padding: '15px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '8px'
            }}>
              <p><strong>Certificate Hash:</strong></p>
              <code style={{
                background: '#f4f4f4',
                padding: '5px',
                borderRadius: '4px',
                wordBreak: 'break-all',
                fontSize: '12px'
              }}>
                {result.backend.hash}
              </code>
              {result.backend.txHash && (
                <p style={{ marginTop: '10px' }}>
                  <strong>Transaction:</strong>
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${result.backend.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#667eea', textDecoration: 'underline' }}
                  >
                    View on Polygonscan
                  </a>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(result.backend.hash)
              setStatus('📋 Hash copied to clipboard!')
              setTimeout(() => setStatus(''), 3000)
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#4a5568',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📋 Copy Hash for Verification
          </button>
        </div>
      )}
    </div>
  )
}
