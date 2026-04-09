import Image from 'next/image';

/**
 * This file defines the home page for the JAYPVENTURES LLC website.
 *
 * The page is designed using a dark, editorial palette with controlled
 * neon accents. Each section follows the structure outlined in the
 * implementation plan and includes the final copy provided by the user.
 *
 * Note: Image assets referenced in this file (e.g. `/logo.png`,
 * `/founder-hero.png`, `/dualbrand-logo.png`) should be placed in the
 * `public/` directory of your Next.js project. Replace the filenames
 * accordingly if you choose different names or locations.
 */

export default function Home() {
  return (
    <main className="bg-[#0F1115] text-[#EAEAEA] font-sans antialiased overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0F1115]/80 border-b border-[#2A2230]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo and brand name */}
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="JAYPVENTURES LLC" width={40} height={40} />
            <span className="text-xl font-semibold tracking-wider uppercase">JAYPVENTURES LLC</span>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-wide text-[#A0A4AB]">
            <a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a>
            <a href="#automation" className="hover:text-white transition-colors">Automation</a>
            <a href="#monetization" className="hover:text-white transition-colors">Monetization</a>
            <a href="#execution" className="hover:text-white transition-colors">Execution</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#insights" className="hover:text-white transition-colors">Insights</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>
          {/* CTA button */}
          <a
            href="#contact"
            className="ml-6 px-4 py-2 rounded-md bg-[#1A1D23] hover:bg-[#2A2230] transition-colors text-sm font-medium"
          >
            Start a Project
          </a>
        </div>
      </header>

      {/* Spacer to offset fixed header height */}
      <div className="h-20" />

      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center max-w-7xl mx-auto px-6 py-24" id="hero">
        {/* Text content */}
        <div className="md:w-1/2 space-y-6 pr-0 md:pr-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
            Digital infrastructure engineered for clarity, automation, and scale.
          </h1>
          <p className="text-lg text-[#A0A4AB] max-w-lg">
            I design and operate structured digital systems that remove friction, align operations, and turn complex environments into controlled execution.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="#infrastructure"
              className="px-6 py-3 rounded-md bg-[#1A1D23] hover:bg-[#2A2230] transition-colors text-sm font-medium"
            >
              Explore Systems
            </a>
            <a
              href="#services"
              className="px-6 py-3 rounded-md border border-[#2A2230] hover:bg-[#2A2230] transition-colors text-sm font-medium"
            >
              View Capabilities
            </a>
          </div>
          <p className="text-sm mt-6 italic text-[#6B6F76]">
            Built in real time. Proven in real environments.
          </p>
        </div>
        {/* Hero image */}
        <div className="md:w-1/2 mt-12 md:mt-0 relative">
          <div className="relative w-full h-96">
            <Image
              src="/founder-hero.png"
              alt="Founder portrait"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* System Pillars Section */}
      <section id="infrastructure" className="bg-[#1A1D23] py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Infrastructure</h3>
            <p className="text-sm text-[#A0A4AB]">
              Architected platforms designed to support scale from the start.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Automation</h3>
            <p className="text-sm text-[#A0A4AB]">
              Workflow systems that eliminate manual operations and reduce friction across environments.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Monetization</h3>
            <p className="text-sm text-[#A0A4AB]">
              Revenue systems structured for consistency, conversion, and long-term retention.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Execution</h3>
            <p className="text-sm text-[#A0A4AB]">
              Systems aligned to deliver outcomes with clarity, control, and measurable performance.
            </p>
          </div>
        </div>
      </section>

      {/* Proven Systems Section */}
      <section className="py-20" id="systems">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Proven Systems.</h2>
          <p className="max-w-2xl mx-auto text-[#A0A4AB] mb-12">
            Structured environments built for performance, efficiency, and controlled growth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="p-6 bg-[#1A1D23] rounded-lg border border-[#2A2230] hover:shadow-lg transition-shadow">
              <h4 className="text-lg font-semibold mb-2">Secure &amp; Scalable</h4>
              <p className="text-sm text-[#A0A4AB]">
                Systems designed to support growth without operational breakdown. Multi-platform environments structured for long-term expansion.
              </p>
            </div>
            {/* Card 2 */}
            <div className="p-6 bg-[#1A1D23] rounded-lg border border-[#2A2230] hover:shadow-lg transition-shadow">
              <h4 className="text-lg font-semibold mb-2">Automated Workflows</h4>
              <p className="text-sm text-[#A0A4AB]">
                Connected workflows that eliminate repetitive execution and reduce manual input. Automation across onboarding, payments, and access systems.
              </p>
            </div>
            {/* Card 3 */}
            <div className="p-6 bg-[#1A1D23] rounded-lg border border-[#2A2230] hover:shadow-lg transition-shadow">
              <h4 className="text-lg font-semibold mb-2">Revenue Optimization</h4>
              <p className="text-sm text-[#A0A4AB]">
                Monetization systems aligned with user behavior and conversion flow. Structured pathways from entry to retention.
              </p>
            </div>
            {/* Card 4 */}
            <div className="p-6 bg-[#1A1D23] rounded-lg border border-[#2A2230] hover:shadow-lg transition-shadow">
              <h4 className="text-lg font-semibold mb-2">Strategy Execution</h4>
              <p className="text-sm text-[#A0A4AB]">
                Systems that translate planning into structured implementation. Execution frameworks aligned with measurable outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Offers Section */}
      <section id="services" className="bg-[#1A1D23] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Built for controlled growth.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-[#2A2230] p-8 rounded-lg border border-[#3A3342] text-left">
              <h4 className="text-lg font-semibold mb-2">Full Ecosystem Build</h4>
              <p className="text-sm text-[#A0A4AB]">
                End-to-end digital infrastructure including platform architecture, automation workflows, and monetization systems designed to operate as a single environment.
              </p>
            </div>
            <div className="bg-[#2A2230] p-8 rounded-lg border border-[#3A3342] text-left">
              <h4 className="text-lg font-semibold mb-2">Automation Implementation</h4>
              <p className="text-sm text-[#A0A4AB]">
                Custom workflow systems connecting Stripe, onboarding, access control, communication, and backend operations.
              </p>
            </div>
            <div className="bg-[#2A2230] p-8 rounded-lg border border-[#3A3342] text-left">
              <h4 className="text-lg font-semibold mb-2">Conversion Environment Build</h4>
              <p className="text-sm text-[#A0A4AB]">
                High-performance web environments engineered to guide user behavior, improve clarity, and increase conversion.
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="inline-block mt-12 px-6 py-3 rounded-md bg-[#1A1D23] hover:bg-[#2A2230] transition-colors text-sm font-medium"
          >
            View Services
          </a>
        </div>
      </section>

      {/* Founder Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 relative h-80 md:h-96 mb-12 md:mb-0">
            <Image
              src="/founder-secondary.png"
              alt="Founder secondary portrait"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 md:pl-12 space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold">Built through execution, not theory.</h2>
            <p className="text-sm text-[#A0A4AB]">
              I design digital infrastructure that removes friction and replaces effort with structured systems. My work spans platform architecture, automation workflows, and monetization environments built to operate beyond manual input. Every system is designed to function as a connected environment — aligned, efficient, and scalable.
            </p>
            <p className="italic text-sm text-[#6B6F76]">Precision is a standard, not a feature.</p>
          </div>
        </div>
      </section>

      {/* Operational Outcomes Section */}
      <section className="bg-[#1A1D23] py-20" id="outcomes">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Proof over noise.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Outcome 1</h4>
              <p className="text-sm text-[#A0A4AB]">
                Reduced dependency on manual workflows across connected digital environments.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Outcome 2</h4>
              <p className="text-sm text-[#A0A4AB]">
                Built monetization systems designed for recurring revenue and retention.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold">Outcome 3</h4>
              <p className="text-sm text-[#A0A4AB]">
                Structured multi-platform systems supporting scale, access control, and execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Brand Section */}
      <section className="py-20" id="bridge">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Built through systems. Expanded through ventures.</h2>
          <p className="max-w-3xl mx-auto text-[#A0A4AB] mb-12">
            JAYPVENTURES LLC leads the infrastructure layer — building systems for clarity, automation, and monetization. jaypventures extends the ecosystem through creative execution, audience growth, and venture expansion. Two layers. One system.
          </p>
          <div className="w-64 h-64 mx-auto">
            <Image
              src="/dualbrand-logo.png"
              alt="Dual brand logo"
              layout="responsive"
              width={256}
              height={256}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="contact" className="bg-[#1A1D23] py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">Start with structure.</h2>
          <p className="max-w-2xl mx-auto text-[#A0A4AB] mb-8">
            For consulting, partnerships, infrastructure builds, or venture-related inquiries, reach out directly.
          </p>
          <a
            href="mailto:venture@jaypventures"
            className="inline-block px-6 py-3 rounded-md bg-[#1A1D23] hover:bg-[#2A2230] transition-colors text-sm font-medium"
          >
            Start a Project
          </a>
          <p className="mt-4 text-sm text-[#6B6F76]">venture@jaypventures</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1115] border-t border-[#2A2230] py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">JAYPVENTURES LLC</h4>
            <p className="text-sm text-[#A0A4AB]">
              Digital infrastructure, automation, and monetization systems built with precision.
            </p>
          </div>
          {/* Links */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Navigation</h4>
            <ul className="text-sm space-y-1 text-[#A0A4AB]">
              <li><a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a></li>
              <li><a href="#automation" className="hover:text-white transition-colors">Automation</a></li>
              <li><a href="#monetization" className="hover:text-white transition-colors">Monetization</a></li>
              <li><a href="#execution" className="hover:text-white transition-colors">Execution</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Contact</h4>
            <p className="text-sm text-[#A0A4AB]">venture@jaypventures</p>
            <p className="text-xs text-[#6B6F76]">© JAYPVENTURES LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}