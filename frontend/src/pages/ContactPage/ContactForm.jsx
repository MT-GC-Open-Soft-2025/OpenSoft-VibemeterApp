import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import AppShell from '@/components/AppShell/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ContactForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await emailjs.send(
        'service_a4qj7tr',
        'template_dmmicgj',
        { from_name: formData.name, from_email: formData.email, message: formData.message },
        'HdJeyKeeZ-eU_AELB',
      );
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <AppShell title="Contact Us" showBack>
      <div className="max-w-4xl mx-auto pb-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}>
            ✉️
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Get in Touch</h1>
          <p className="text-sm text-muted-foreground mt-2">Our team is ready to answer all your questions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

          {/* Contact info */}
          <div className="md:col-span-2">
            <Card className="shadow-sm h-full">
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">Let's Talk</h2>
                  <p className="text-sm text-muted-foreground">
                    Whether you have a question about features, pricing, or anything else — we're here.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: '📍', label: 'Address', value: '123 WellBee Street, Tech City, NY' },
                    { icon: '✉️', label: 'Email', value: 'support@wellbee.com' },
                    { icon: '📞', label: 'Phone', value: '+1 (555) 123-4567' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[hsl(var(--accent))] flex items-center justify-center text-base flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm text-foreground font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Decorative gradient */}
                <div
                  className="h-1.5 w-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #0f766e, #0369a1, #6366f1)' }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                {status === 'success' && (
                  <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-800">
                    <AlertDescription>✓ Message sent successfully! We'll get back to you soon.</AlertDescription>
                  </Alert>
                )}
                {status === 'error' && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>Failed to send message. Please try again.</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-semibold">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #0f766e, #0369a1)' }}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </span>
                    ) : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ContactForm;
