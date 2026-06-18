'use client';

import React, { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { PageTransition } from '@/components/layout/PageTransition';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { STORE_CONFIG } from '@/lib/constants';
import { submitContactMessage } from '@/lib/actions/contactActions';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    subject: '',
    message: '',
  });

  const messageMaxLength = 2000;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('first_name', formData.first_name);
      fd.append('last_name', formData.last_name);
      fd.append('email', formData.email);
      fd.append('subject', formData.subject);
      fd.append('message', formData.message);

      const result = await submitContactMessage(fd);

      if (result.success) {
        toast.success('Your message has been sent successfully! We will get back to you soon.');
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        console.error('[contact] Submit error:', result.error);
        toast.error(result.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('[contact] Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition className="pt-8">
      <Container>
        <SectionTitle
          title="Contact Us"
          subtitle="Have a question about our products or need help? We're always here for you."
          className="mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ─── Contact Information Card ─── */}
          <div className="space-y-8">
            <div className="bg-card border border-border p-8 md:p-10 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

              <h3 className="text-2xl font-bold mb-8 relative z-10">Contact Information</h3>

              <div className="space-y-8 relative z-10">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">Address</p>
                    <p className="text-foreground">{STORE_CONFIG.address}</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 bg-[#25D366]/10 rounded-2xl flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">WhatsApp</p>
                    <a
                      href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-[#25D366] transition-colors inline-flex items-center gap-1.5 group"
                    >
                      +62 812-1685-7823
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${STORE_CONFIG.email}`}
                      className="text-foreground hover:text-blue-500 transition-colors inline-flex items-center gap-1.5 group"
                    >
                      {STORE_CONFIG.email}
                      <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex gap-4">
                  <div className="h-12 w-12 shrink-0 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">Operating Hours</p>
                    <p className="text-foreground">Monday – Friday: 09:00 – 18:00</p>
                    <p className="text-foreground">Saturday: 10:00 – 15:00</p>
                    <p className="text-muted-foreground text-sm mt-1">Sunday & public holidays: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-[#25D366]/5 border border-[#25D366]/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="h-14 w-14 shrink-0 bg-[#25D366]/10 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-7 w-7 text-[#25D366]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Need immediate assistance?</p>
                <p className="text-sm text-muted-foreground">Chat with us directly on WhatsApp for a faster response.</p>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-[#25D366]/30 bg-[#25D366]/5 hover:bg-[#25D366]/15 text-[#25D366] shrink-0"
                onClick={() => window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}`, '_blank')}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Chat Now
              </Button>
            </div>
          </div>

          {/* ─── Contact Form ─── */}
          <div className="bg-card border border-border p-8 md:p-10 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <h3 className="text-2xl font-bold mb-6 relative z-10">Send us a message</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-sm font-medium">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="Alex"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-sm font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Player"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Question about Predator REVO"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  maxLength={150}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs transition-colors ${
                      formData.message.length > messageMaxLength
                        ? 'text-red-500 font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formData.message.length}/{messageMaxLength}
                  </span>
                </div>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="How can we help you?"
                  className="min-h-[150px] resize-none"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  maxLength={messageMaxLength}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="rounded-full w-full sm:w-auto mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </PageTransition>
  );
}
