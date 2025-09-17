import React from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ShieldCheckIcon, CloudArrowUpIcon, MagnifyingGlassIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function Layout({ children }) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/upload', icon: CloudArrowUpIcon, label: 'Upload' },
    { path: '/verify', icon: MagnifyingGlassIcon, label: 'Verify' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2 bg-white bg-opacity-20 rounded-lg"
              >
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-white">Pramaan</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-3 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}
