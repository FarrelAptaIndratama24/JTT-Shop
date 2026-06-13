'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Container } from '../layout/Container';

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-card/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto p-12 md:p-16 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            Siap Tingkatkan Permainan Anda?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/70 mb-10 max-w-xl"
          >
            Jelajahi koleksi premium billiard cues dan aksesoris kami. Temukan perlengkapan sempurna yang sesuai dengan gaya permainan Anda.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            {/* CTA: Navigate to /products */}
            <Button asChild size="lg" className="w-full sm:w-auto rounded-full group">
              <Link href="/products">
                Belanja Sekarang
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            {/* CTA: Navigate to /community */}
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white">
              <Link href="/community">
                Gabung Komunitas
              </Link>
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
