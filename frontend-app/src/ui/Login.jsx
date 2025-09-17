import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../AuthContext'

const backendBase = import.meta.env.VITE_BACKEND_BASE || 'http://localhost:4000'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // 'phone' or 'otp'
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const { setCurrentUser } = useAuth()

  async function sendOTP() {
    if (!phone) {
      setStatus('Please enter your phone number')
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.post(`${backendBase}/auth/send-otp`, { phone })
      setStatus('✅ OTP sent to your phone!')
      setStep('otp')
      
      // For demo: show OTP in console if available
      if (response.data.demoOTP) {
        console.log(`🔐 Demo OTP: ${response.data.demoOTP}`)
        setStatus(`✅ OTP sent! Demo OTP: ${response.data.demoOTP}`)
      }
    } catch (error) {
      console.error('Error sending OTP:', error)
      setStatus('❌ Error sending OTP: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    if (!otp) {
      setStatus('Please enter the OTP')
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.post(`${backendBase}/auth/verify-otp`, { phone, otp })
      
      // Store authentication data
      localStorage.setItem('idToken', response.data.token)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userPhone', response.data.user.phoneNumber)
      
      // Update auth context
      setCurrentUser({ phoneNumber: response.data.user.phoneNumber })
      
      setStatus('🎉 Login successful!')
    } catch (error) {
      console.error('Error verifying OTP:', error)
      setStatus('❌ Invalid OTP: ' + (error.response?.data?.error || error.message))
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
          🔐 Secure Login
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          Enter your phone number to receive a secure OTP
        </p>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {step === 'phone' ? (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                color: 'white', 
                fontWeight: '600', 
                marginBottom: '12px',
                fontSize: '1rem'
              }}>
                📱 Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
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
            </div>
            
            <button
              onClick={sendOTP}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: loading 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading 
                  ? 'none' 
                  : '0 10px 30px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '📤 Sending...' : '📤 Send OTP'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                color: 'white', 
                fontWeight: '600', 
                marginBottom: '12px',
                fontSize: '1rem'
              }}>
                🔑 Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  letterSpacing: '0.2em',
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
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={verifyOTP}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background: loading 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading 
                    ? 'none' 
                    : '0 10px 30px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '🔍 Verifying...' : '✅ Verify OTP'}
              </button>
              
              <button
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setStatus('')
                }}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back to Phone Number
              </button>
            </div>
          </div>
        )}
        
        {status && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500',
            background: status.includes('❌') || status.includes('Invalid')
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${status.includes('❌') || status.includes('Invalid')
              ? 'rgba(239, 68, 68, 0.3)'
              : 'rgba(16, 185, 129, 0.3)'}`,
            color: status.includes('❌') || status.includes('Invalid')
              ? '#fca5a5'
              : '#86efac'
          }}>
            {status}
          </div>
        )}
      </div>
    </div>
  )
}
