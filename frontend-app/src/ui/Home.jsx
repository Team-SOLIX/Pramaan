import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ShieldCheckIcon, 
  CloudArrowUpIcon, 
  MagnifyingGlassIcon, 
  CpuChipIcon,
  LockClosedIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Security',
      description: 'Immutable certificate storage on Polygon blockchain ensures tamper-proof verification.'
    },
    {
      icon: CpuChipIcon,
      title: 'AI-Powered Detection',
      description: 'Advanced AI algorithms detect tampering and fraudulent documents with high accuracy.'
    },
    {
      icon: LockClosedIcon,
      title: 'End-to-End Encryption',
      description: 'AES-256 encryption protects your sensitive documents throughout the process.'
    }
  ]

  const stats = [
    { number: '99.9%', label: 'Detection Accuracy' },
    { number: '< 2s', label: 'Verification Time' },
    { number: '100%', label: 'Tamper-Proof' },
    { number: '24/7', label: 'Availability' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Secure Certificate
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Verification
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white text-opacity-90 mb-8 max-w-3xl mx-auto">
                Combat fake certificates and academic fraud with blockchain technology and AI-powered tamper detection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/upload">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                >
                  <CloudArrowUpIcon className="h-6 w-6" />
                  <span>Upload Certificate</span>
                </motion.button>
              </Link>
              
              <Link to="/verify">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                  <span>Verify Certificate</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Floating Certificate Animation */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="relative mx-auto w-64 h-40 md:w-80 md:h-48">
              <motion.div
                className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl border border-white border-opacity-20 p-6 float"
                animate={{ 
                  rotateY: [0, 5, 0, -5, 0],
                  rotateX: [0, 2, 0, -2, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <CheckBadgeIcon className="h-8 w-8 text-green-400" />
                  <span className="text-white text-sm font-medium">VERIFIED</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white bg-opacity-30 rounded w-3/4"></div>
                  <div className="h-2 bg-white bg-opacity-30 rounded w-1/2"></div>
                  <div className="h-2 bg-white bg-opacity-30 rounded w-2/3"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white text-opacity-70 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Pramaan?
            </h2>
            <p className="text-xl text-white text-opacity-80 max-w-2xl mx-auto">
              Built for the future of document verification with cutting-edge technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="card text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 group-hover:shadow-lg"
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white text-opacity-80 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="card"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Secure Your Certificates?
            </h2>
            <p className="text-xl text-white text-opacity-80 mb-8">
              Join the revolution in document verification. Start protecting your certificates today.
            </p>
            <Link to="/upload">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-4"
              >
                Get Started Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
