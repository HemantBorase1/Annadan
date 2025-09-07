'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(16,185,129,0.0)',
              '0 0 0 12px rgba(16,185,129,0.15)',
              '0 0 0 0 rgba(16,185,129,0.0)'
            ]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-full p-3"
        >
          <Image src="/Logo.png" alt="AnnaDan" width={80} height={80} priority className="rounded-full" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          className="mt-4 text-sm text-gray-600"
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  )
}




