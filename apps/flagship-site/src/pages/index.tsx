import React from "react";
import { HomeHero } from "../../../../shared/components/HomeHero";

export default function Home() {
  return (
    <>
      <HomeHero />
      <style jsx global>{`
        html,
        body {
          margin: 0;
        }
      `}</style>
    </>
  );
}
