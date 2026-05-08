import React from "react";
import { HomeHero } from "../shared/components/HomeHero";

export default function Home() {
  return (
    <>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <HomeHero />
    </>
  );
}
