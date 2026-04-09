import Head from 'next/head';
import Link from 'next/link';
import Header from '../header';
import Footer from '../footer';

const livestreamFormats = [
  {
    title: 'Toonz Tuesday',
    description:
      'Long-form vibey music sessions built for retention, passive engagement, and community rhythm.',
    meta: 'Anchor night • 3.5–5 hours • retention + gifts',
  },
  {
    title: 'Wildn Out Wednesday',
    description:
      'High-energy, reactive livestreams with stronger audience participation and gifting potential.',
    meta: 'Support night • 2.5–4 hours • engagement + gifts',
  },
  {
    title: 'TravelTok Thursday',
    description:
      'Story-led travel sessions focused on connection, audience depth, and future-facing content.',
    meta: 'Relationship night • 1.5–3 hours • story + clips',
  },
  {
    title: 'Find Out Friday',
    description:
      'Teaser-driven livestreams that build anticipation around upcoming plans, ideas, and releases.',
    meta: 'Support night • 2–4 hours • momentum + conversion',
  },
  {
    title: 'VIP Sunday',
    description:
      'Support-focused sessions designed to concentrate loyalty, deepen community, and maximize monetization.',
    meta: 'Anchor night • 3–5 hours • loyalty + revenue',
  },
];

const brandGroups = [
  {
    heading: 'Premium & Established',
    brands: [
      'Laura Mercier',
      'Laura Geller Beauty',
      'Make Up For Ever',
      'Bare Minerals',
      'Haus Labs',
    ],
  },
  {
    heading: 'Growth & Performance',
    brands: [
      'The Face Shop US',
      'APRILSKIN USA',
      'Dr. Groot Hair',
      'Primeval Labs',
      'Gorilla Mind',
    ],
  },
  {
    heading: 'Affiliate / Volume Partners',
    brands: [
      'FeelingGirl-US',
      'Mare Azzuro',
      'Tessan Shop US',
      'VUSIGN US',
      'MetaVita Corp',
      'SNOWY Beautiful',
    ],
  },
];

export default function VenturesPage() {
  return (
    <>
      <Head>
        <title>Ventures – JAYPVENTURES LLC</title>
        <meta
          name="description"
          content="Explore live programming, collaborative brands, creator partnerships, analytics, and venture expansion inside the JAYPVENTURES ecosystem."
        />
        <link rel="canonical" href="https://www.jaypventuresllc.com/ventures" />
        <meta property="og:title" content="Ventures – JAYPVENTURES LLC" />
        <meta
          property="og:description"
          content="Explore live programming, collaborative brands, creator partnerships, analytics, and venture expansion inside the JAYPVENTURES ecosystem."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.jaypventuresllc.com/ventures" />
      </Head>

      <Header />
      <div className="h-20" />

      <main className="min-h-screen bg-[#0F1115] text-[#EAEAEA] font-sans antialiased overflow-x-hidden">
        <section className="py-24 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Ventures &amp; Ecosystem
          </h1>
          <p className="max-w-2xl mx-auto text-[#A0A4AB] text-lg leading-8">
            Explore how jaypventures extends infrastructure into creator programming,
            partnerships, collaborative brands, and live audience experiences.
          </p>
        </section>

        <section className="py-20 px-6" aria-labelledby="live-programming-heading">
          <div className="max-w-7xl mx-auto">
            <h2
              id="live-programming-heading"
              className="text-3xl md:text-4xl font-serif font-semibold mb-6"
            >
              Live Programming &amp; Creator Experiences
            </h2>

            <p className="max-w-3xl text-[#A0A4AB] leading-8 mb-10">
              jaypventures runs a recurring livestream cadence designed around audience
              retention, creator identity, and measurable engagement. Each stream format
              serves a different function across connection, entertainment, conversion,
              and long-term community growth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              {livestreamFormats.map((item) => (
                <article
                  key={item.title}
                  tabIndex={0}
                  aria-label={`${item.title} livestream format`}
                  className="rounded-2xl border border-[#2A2230] bg-[#16191f] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#FF2D9A] focus:outline-none focus:ring-2 focus:ring-[#FF2D9A]"
                >
                  <h3 className="text-2xl font-serif font-semibold mb-4">{item.title}</h3>
                  <p className="text-[#A0A4AB] text-sm leading-7 mb-6">{item.description}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#FF2D9A]">
                    {item.meta}
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-8 text-sm text-[#A0A4AB] leading-7">
              Built using real audience behavior, engagement rhythm, and revenue trends
              across recent livestream performance.
            </p>
          </div>
        </section>

        <section className="bg-[#1A1D23] py-20 px-6" aria-labelledby="social-analytics-heading">
          <div className="max-w-7xl mx-auto">
            <h2
              id="social-analytics-heading"
              className="text-3xl md:text-4xl font-serif font-semibold mb-8"
            >
              Social Media Analytics
            </h2>
            <p className="text-[#A0A4AB] mb-6 max-w-3xl leading-8">
              This section is ready for your real platform metrics once you provide them.
              Recommended fields: total followers, average views, engagement rate, top-performing
              live format, and top-converting content category.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                'Followers',
                'Avg. Views',
                'Engagement Rate',
                'Top Category',
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#2A2230] bg-[#11141a] p-6"
                >
                  <p className="text-3xl font-bold mb-2">—</p>
                  <p className="text-sm text-[#A0A4AB]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6" aria-labelledby="brands-heading">
          <div className="max-w-7xl mx-auto">
            <h2
              id="brands-heading"
              className="text-3xl md:text-4xl font-serif font-semibold mb-8"
            >
              Collaborative Brands
            </h2>

            <div className="space-y-10">
              {brandGroups.map((group) => (
                <div key={group.heading}>
                  <h3 className="text-lg uppercase tracking-[0.18em] text-[#A0A4AB] mb-4">
                    {group.heading}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {group.brands.map((brand) => (
                      <span
                        key={brand}
                        className="rounded-full border border-[#2A2230] bg-[#16191f] px-4 py-2 text-sm"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#1A1D23] py-20 px-6" aria-labelledby="bookings-heading">
          <div className="max-w-7xl mx-auto">
            <h2
              id="bookings-heading"
              className="text-3xl md:text-4xl font-serif font-semibold mb-6"
            >
              Livestream &amp; Creator Bookings
            </h2>
            <p className="text-[#A0A4AB] mb-6 max-w-3xl leading-8">
              This block is ready for your booking tool and live scheduling workflow.
              Once you choose the platform, this section can support livestream requests,
              campaign scheduling, creator partnerships, and audience-facing bookings.
            </p>

            <div className="rounded-2xl border border-[#2A2230] bg-[#11141a] p-8 text-center text-[#A0A4AB]">
              Booking calendar / livestream embed ready for final platform wiring
            </div>
          </div>
        </section>

        <section className="py-20 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Ready to build with jaypventures?
          </h2>
          <p className="max-w-2xl mx-auto text-[#A0A4AB] mb-8 leading-8">
            Explore creator partnerships, campaign opportunities, and live programming
            designed for engagement and conversion.
          </p>
          <Link
            href="/contact"
            aria-label="Go to contact page"
            className="inline-block px-6 py-3 rounded-md bg-[#1A1D23] hover:bg-[#2A2230] transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF2D9A]"
          >
            Get in Touch
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}

