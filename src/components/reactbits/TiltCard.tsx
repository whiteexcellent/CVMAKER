'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function TiltCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x, { stiffness: 400, damping: 25 })
    const mouseYSpring = useSpring(y, { stiffness: 400, damping: 25 })

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top
        
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        
        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            animate={{
                scale: isHovered ? 1.02 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`relative perspective-1000 ${className}`}
        >
            <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }} className="w-full h-full relative z-10">
                {children}
            </div>
            {/* Soft highlight effect moving with mouse */}
            {isHovered && (
                <motion.div 
                    className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-30"
                    style={{
                        background: `radial-gradient(circle at ${(x.get() + 0.5) * 100}% ${(y.get() + 0.5) * 100}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
                    }}
                />
            )}
        </motion.div>
    )
}
