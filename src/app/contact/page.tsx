'use client';

import React from 'react';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { STORE_CONFIG } from '@/lib/constants';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy submit action
    toast.success('Your message has been sent successfully! We will get back to you soon.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <PageTransition className="pt-8">
      <Container>
        <SectionTitle 
          title="Contact Us" 
          subtitle="Have a question about our products or need help? We're always here for you."
          className="mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Information & Map */}
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-medium mb-1">
                  <Phone className="h-5 w-5" /> Phone & WhatsApp
                </div>
                <p className="text-muted-foreground">+{STORE_CONFIG.whatsappNumber}</p>
                <p className="text-sm text-muted-foreground">Mon-Fri from 9am to 6pm.</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-medium mb-1">
                  <Mail className="h-5 w-5" /> Email
                </div>
                <p className="text-muted-foreground">{STORE_CONFIG.email}</p>
                <p className="text-sm text-muted-foreground">We typically reply within 2 hours.</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-medium mb-1">
                  <MapPin className="h-5 w-5" /> Head Office
                </div>
                <p className="text-muted-foreground">{STORE_CONFIG.address}</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-medium mb-1">
                  <Clock className="h-5 w-5" /> Operating Hours
                </div>
                <p className="text-muted-foreground">Monday - Friday: 09:00 - 18:00</p>
                <p className="text-muted-foreground">Saturday: 10:00 - 15:00</p>
              </div>
            </div>

            {/* Dummy Map Placeholder */}
            <div className="relative w-full h-[300px] bg-muted/30 rounded-3xl border border-border overflow-hidden group">
              {/* This simulates a map with an overlay for aesthetic purposes */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')] opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700 bg-cover bg-center" />
              <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-card/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-border">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">JTT Shop HQ</p>
                    <p className="text-xs text-muted-foreground">View on Maps</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border p-8 md:p-10 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl font-bold mb-6 relative z-10">Send us a message</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                  <Input id="firstName" placeholder="Alex" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                  <Input id="lastName" placeholder="Player" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" placeholder="alex@example.com" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input id="subject" placeholder="Question about Predator REVO" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px] resize-none" required />
              </div>
              
              <Button type="submit" size="lg" className="rounded-full w-full sm:w-auto mt-2">
                <Send className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-border/50 text-center relative z-10">
              <p className="text-muted-foreground text-sm mb-4">Or need immediate assistance?</p>
              <Button 
                variant="outline" 
                className="rounded-full border-[#25D366]/20 bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#25D366]"
                onClick={() => window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}`, '_blank')}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Chat via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </PageTransition>
  );
}
