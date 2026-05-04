
import React, { useState, useEffect } from 'react';


const mockData = [
  {
    business: 'JAYPVENTURES LLC',
    metrics: [
      { label: 'Revenue', value: '$1.2M', trend: '+8%' },
      { label: 'Active Users', value: '4,200', trend: '+2%' },
      { label: 'Conversion Rate', value: '7.1%', trend: '+0.3%' },
      { label: 'NPS', value: '68', trend: '+4' },
    ],
  },
  {
    business: 'Creator Partnerships',
    metrics: [
      { label: 'Revenue', value: '$320K', trend: '+12%' },
      { label: 'Active Users', value: '1,100', trend: '+5%' },
      { label: 'Conversion Rate', value: '5.4%', trend: '-0.2%' },
      { label: 'NPS', value: '74', trend: '+2' },
    ],
  },
  {
    business: 'Brand Collabs',
    metrics: [
      { label: 'Revenue', value: '$540K', trend: '+3%' },
      { label: 'Active Users', value: '2,800', trend: '+1%' },
      { label: 'Conversion Rate', value: '6.2%', trend: '+0.1%' },
      { label: 'NPS', value: '61', trend: '-1' },
    ],
  },
];

function formatSocialMetrics(data: any) {
  if (!data) return [];
  return Object.entries(data).map(([platform, metrics]: any) => ({
    business: platform.charAt(0).toUpperCase() + platform.slice(1),
    metrics: [
      { label: 'Followers', value: metrics.followers?.toLocaleString?.() ?? '-', trend: '' },
      { label: 'Avg. Views', value: metrics.avgViews?.toLocaleString?.() ?? '-', trend: '' },
      { label: 'Engagement Rate', value: metrics.engagementRate ?? '-', trend: '' },
      { label: 'Top Category', value: metrics.topCategory ?? '-', trend: '' },
    ],
  }));
}


export default function Dashboard() {
  const [selected, setSelected] = useState(0);
  const [socialMetrics, setSocialMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/social-metrics')
      .then((res) => res.json())
      .then((data) => setSocialMetrics(formatSocialMetrics(data)))
      .catch(() => setSocialMetrics([]))
      .finally(() => setLoading(false));
  }, []);

  const allTabs = [
    ...mockData,
    { business: 'Social Metrics', metrics: [] },
  ];

  return (
    <section className="py-20 px-6" aria-labelledby="dashboard-heading">
      <div className="max-w-7xl mx-auto">
        <h2 id="dashboard-heading" className="text-3xl md:text-4xl font-serif font-semibold mb-8">
          Business Metrics & KPIs
        </h2>
        <div className="flex space-x-4 mb-8">
          {allTabs.map((b, idx) => (
            <button
              key={b.business}
              className={`px-4 py-2 rounded-md border transition-colors text-sm font-medium ${selected === idx ? 'bg-[#FF2D9A] text-white border-[#FF2D9A]' : 'bg-[#1A1D23] text-[#A0A4AB] border-[#2A2230] hover:bg-[#2A2230]'}`}
              onClick={() => setSelected(idx)}
            >
              {b.business}
            </button>
          ))}
        </div>
        {/* Social Metrics Tab */}
        {selected === allTabs.length - 1 ? (
          loading ? (
            <div className="text-[#A0A4AB]">Loading social metrics...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {socialMetrics.length === 0 && (
                <div className="col-span-4 text-[#A0A4AB]">No social metrics available.</div>
              )}
              {socialMetrics.map((platform) =>
                platform.metrics.map((m: any) => (
                  <div key={platform.business + m.label} className="rounded-2xl border border-[#2A2230] bg-[#11141a] p-6">
                    <p className="text-3xl font-bold mb-2">{m.value}</p>
                    <p className="text-sm text-[#A0A4AB]">{platform.business} – {m.label}</p>
                  </div>
                ))
              )}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mockData[selected].metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-[#2A2230] bg-[#11141a] p-6">
                <p className="text-3xl font-bold mb-2">{m.value}</p>
                <p className="text-sm text-[#A0A4AB]">{m.label}</p>
                <p className={`text-xs mt-2 ${m.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.trend}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
