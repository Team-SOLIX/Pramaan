import React, { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../AuthContext'
import Upload from './Upload'
import Verify from './Verify'
import Login from './Login'

export default function App() {
  const [view, setView] = useState('upload')
  const { currentUser, isLoggedIn, setCurrentUser } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('idToken')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userPhone')
      setCurrentUser(null)
      setView('login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }}></div>
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
            }}>
              🛡️
            </div>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Pramaan
            </h1>
          </div>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Blockchain-powered certificate verification with AI tamper detection
          </p>
          
          {/* User Status */}
          {isLoggedIn && (
            <div style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '8px 16px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%'
              }}></div>
              <span style={{ color: '#86efac', fontSize: '0.9rem', fontWeight: '500' }}>
                Logged in as {currentUser?.phoneNumber}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                  e.target.style.color = 'white'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'none'
                  e.target.style.color = 'rgba(255,255,255,0.6)'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
        
        {/* Modern Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {[
              { key: 'upload', label: '📤 Upload', icon: '📤' },
              { key: 'verify', label: '🔍 Verify', icon: '🔍' },
              { key: 'login', label: '🔐 Login', icon: '🔐' }
            ].map(tab => (
              <button 
                key={tab.key}
                onClick={() => setView(tab.key)} 
                style={{
                  padding: '16px 32px',
                  border: 'none',
                  background: view === tab.key 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  fontSize: '16px',
                  marginRight: tab.key === 'login' ? '0' : '8px',
                  boxShadow: view === tab.key 
                    ? '0 10px 30px rgba(102, 126, 234, 0.4)' 
                    : 'none',
                  transform: view === tab.key ? 'translateY(-2px)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
          padding: '40px',
          minHeight: '500px'
        }}>
          {view === 'login' && <Login />}
          {view === 'upload' && <Upload />}
          {view === 'verify' && <Verify />}
        </div>
      </div>
    </div>
  )
}


