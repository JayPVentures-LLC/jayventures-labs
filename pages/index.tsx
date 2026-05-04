import React from "react";

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>JayPVentures Flagship Site</h1>
      <p>Welcome! This is your flagship Next.js site. If you see this page, your build and dev server are working.</p>
      <ul>
        <li>Update <code>pages/index.tsx</code> to customize your homepage.</li>
        <li>See <code>apps/flagship-site/src/lib/render.ts</code> for route and content logic.</li>
      </ul>
    </main>
  );
}
