import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Por si alguien guardo el link viejo de la encuesta (.html).
      { source: "/encuesta.html", destination: "/encuesta", permanent: false },
    ];
  },
};

export default nextConfig;
