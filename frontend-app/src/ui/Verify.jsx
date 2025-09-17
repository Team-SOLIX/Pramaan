import React, { useState } from 'react'
import axios from 'axios'

const backendBase = import.meta.env.VITE_BACKEND_BASE || 'http://localhost:4000'

export default function Verify() {
  const [hash, setHash] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  async function onVerify(e) {
    e.preventDefault()
    if (!hash.trim()) {
      setStatus('Please enter a certificate hash')
      return
    }
    
    setLoading(true)
    setResult(null)
    
    try {
      setStatus('🔍 Verifying certificate on blockchain...')
      const res = await axios.get(`${backendBase}/verify/${hash.trim()}`)
      setResult(res.data)
      setStatus(res.data.verified ? '✅ Certificate verified!' : '❌ Certificate not found')
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('❌ Error: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  function pasteFromClipboard() {
    navigator.clipboard.readText().then(text => {
      setHash(text.trim())
    }).catch(() => {
      setStatus('Could not read from clipboard')
    })
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
          🔍 Verify Certificate
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          Enter the certificate hash to verify its authenticity on the blockchain
        </p>
      </div>

      <form onSubmit={onVerify} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            color: 'white', 
            fontWeight: '600', 
            marginBottom: '12px',
            fontSize: '1rem'
          }}>
            🔗 Certificate Hash
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="Enter certificate hash (e.g., abc123def456...)"
              style={{
                flex: 1,
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)'
                e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              type="button"
              onClick={pasteFromClipboard}
              style={{
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              📋 Paste
            </button>
          </div>
        </div>
        
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
            boxShadow: loading 
              ? 'none' 
              : '0 20px 40px rgba(102, 126, 234, 0.4)',
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
              Verifying...
            </>
          ) : (
            <>
              🔍 Verify Certificate
            </>
          )}
        </button>
      </form>

      {status && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '500',
          background: status.includes('❌') || status.includes('Error')
            ? 'rgba(239, 68, 68, 0.1)'
            : status.includes('✅') 
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(59, 130, 246, 0.1)',
          border: `1px solid ${status.includes('❌') || status.includes('Error')
            ? 'rgba(239, 68, 68, 0.3)'
            : status.includes('✅')
            ? 'rgba(16, 185, 129, 0.3)'
            : 'rgba(59, 130, 246, 0.3)'}`,
          color: status.includes('❌') || status.includes('Error')
            ? '#fca5a5'
            : status.includes('✅')
            ? '#86efac'
            : '#93c5fd'
        }}>
          {status}
        </div>
      )}

      {result && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            background: result.verified 
              ? 'rgba(16, 185, 129, 0.2)' 
              : 'rgba(239, 68, 68, 0.2)',
            border: `2px solid ${result.verified ? '#10b981' : '#ef4444'}`
          }}>
            {result.verified ? '✅' : '❌'}
          </div>
          
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '12px',
            color: result.verified ? '#86efac' : '#fca5a5'
          }}>
            {result.verified ? 'Certificate Verified' : 'Certificate Not Found'}
          </h3>
          
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '30px',
            fontSize: '1rem',
            lineHeight: '1.6'
          }}>
            {result.verified 
              ? 'This certificate is authentic and registered on the blockchain'
              : 'This certificate hash was not found in our blockchain registry'
            }
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '12px' }}>
              Certificate Hash
            </h4>
            <code style={{
              color: '#93c5fd',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              lineHeight: '1.4'
            }}>
              {hash}
            </code>
          </div>

          {result.verified && result.blockNumber && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '16px' }}>
                🔗 Blockchain Details
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Block Number:</span>
                <span style={{ color: 'white', fontFamily: 'monospace' }}>{result.blockNumber}</span>
              </div>
              {result.transactionHash && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Transaction:</span>
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${result.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#60a5fa',
                      textDecoration: 'underline',
                      fontSize: '0.9rem'
                    }}
                  >
                    View on Polygonscan ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
