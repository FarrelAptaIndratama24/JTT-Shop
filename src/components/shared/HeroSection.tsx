'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../layout/Container';
import { text } from '@/lib/dictionary';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#05010d]">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#9089fc]/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mask-image-radial" style={{ maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }} />

      <Container className="relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-fit mx-auto lg:mx-0 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-white/90">New Arrivals Available Now</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
            >
              Premium Billiard Cues untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#9089fc]">Pemain Serius</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto lg:mx-0"
            >
              Temukan keseimbangan sempurna antara keahlian, teknologi, dan performa. Tingkatkan permainan Anda dengan peralatan yang dipercaya oleh para juara.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mt-4 justify-center lg:justify-start"
            >
              <Button size="lg" className="rounded-full group text-base h-14 px-8">
                Belanja Sekarang
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="glass" size="lg" className="rounded-full text-base h-14 px-8">
                Jelajahi Komunitas
              </Button>
            </motion.div>
          </div>
          
          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="relative lg:h-[600px] h-[400px] w-full hidden sm:block"
          >
            <Image
              src="/images/bk-rush-shaft.jpg"
              alt="Premium Billiard Cue"
              fill
              className="object-cover rounded-[2rem] shadow-2xl border border-white/10"
              priority
            />
            
            {/* Floating Element 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-8 top-1/4 bg-card/80 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-xl flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">REVO</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Carbon Fiber</p>
                <p className="text-xs text-muted-foreground">Low Deflection</p>
              </div>
            </motion.div>
            
            {/* Floating Element 2 */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -right-8 bottom-1/4 bg-card/80 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-xl flex flex-col gap-1"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs font-medium text-foreground">5.0 dari 2rb+ ulasan</p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
