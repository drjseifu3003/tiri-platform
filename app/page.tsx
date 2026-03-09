"use client";

import { Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="w-full bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
            Eternal Moments
          </div>
          <div className="flex items-center gap-6">
            <a href="#services" className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Services
            </a>
            <a href="#portfolio" className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Portfolio
            </a>
            <a href="#contact" className="text-sm font-semibold rounded-lg px-4 py-2" style={{ background: "var(--primary)", color: "#ffffff" }}>
              Book Now
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32" style={{ background: "var(--primary)" }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
            Professional Wedding Planning
          </p>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
            Your dream wedding, perfectly orchestrated
          </h1>
          <p className="mt-6 text-lg opacity-90 max-w-2xl mx-auto">
            From intimate ceremonies to grand celebrations, we bring your vision to life with meticulous attention to every detail.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="inline-flex items-center justify-center px-8 py-3 font-semibold rounded-lg bg-white text-primary gap-2 hover:opacity-90 transition">
              Schedule Consultation <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#portfolio" className="inline-flex items-center justify-center px-8 py-3 font-semibold rounded-lg border-2 border-white text-white hover:bg-white/10 transition">
              View Portfolio
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              What We Offer
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Comprehensive Wedding Services
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Full Planning", description: "End-to-end coordination from concept to celebration" },
              { title: "Day-of Coordination", description: "Expert management ensuring everything runs smoothly" },
              { title: "Vendor Management", description: "Curated network of trusted professionals" },
              { title: "Venue Selection", description: "Find the perfect setting for your celebration" },
              { title: "Design & Decor", description: "Thematic design that reflects your personality" },
              { title: "Guest Management", description: "Seamless coordination with our digital platform" },
            ].map((service, idx) => (
              <div key={idx} className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)" }}>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {service.title}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: "var(--surface-muted)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Featured Weddings
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Celebrations We've Orchestrated
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
                <div className="h-48 sm:h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-4">
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    Wedding Celebration {item}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    A beautiful ceremony with 150+ guests
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Client Stories
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Loved by Couples
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Sarah & Michael",
                quote: "From the first consultation to our wedding day, the planning was seamless and stress-free. Highly recommended!",
              },
              {
                name: "Emma & David",
                quote: "Our wedding exceeded every expectation. The attention to detail was incredible and our guests loved every moment.",
              },
              {
                name: "Rachel & John",
                quote: "Professional, creative, and dedicated to making our day special. They made the entire process enjoyable.",
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="rounded-lg border p-6" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
                <p className="text-sm italic" style={{ color: "var(--text-secondary)" }}>
                  "{testimonial.quote}"
                </p>
                <p className="mt-4 font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 sm:px-6 lg:px-8 py-20" style={{ background: "var(--surface-muted)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Contact Info */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                Get in Touch
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-semibold" style={{ color: "var(--text-primary)" }}>
                Ready to plan your perfect wedding?
              </h2>
              <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                Let's discuss your vision and create something truly magical.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5" style={{ color: "var(--primary)" }} />
                  <a href="tel:+1234567890" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    +1 (234) 567-8900
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5" style={{ color: "var(--primary)" }} />
                  <a href="mailto:hello@eternalmoments.com" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    hello@eternalmoments.com
                  </a>
                </div>
              </div>
            </div>

            {/* Consultation Form */}
            <div className="rounded-lg border p-8" style={{ borderColor: "var(--border-subtle)", background: "#ffffff" }}>
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Schedule a Free Consultation
              </h3>

              <form className="mt-6 space-y-4" onSubmit={handleConsultationSubmit}>
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={consultationForm.name}
                    onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border-subtle)" }}
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={consultationForm.email}
                    onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border-subtle)" }}
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={consultationForm.phone}
                    onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border-subtle)" }}
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Tell us about your vision..."
                    value={consultationForm.message}
                    onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: "var(--border-subtle)" }}
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-sm font-semibold text-white transition"
                  style={{ background: "var(--primary)" }}
                >
                  {formSubmitted ? "Request Sent!" : "Request Consultation"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 sm:px-6 lg:px-8 py-8" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            © 2024 Eternal Moments. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Privacy Policy
            </a>
            <a href="#" className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
