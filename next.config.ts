import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Lets Lighthouse and browser devtools map the large 3D chunk back to source.
  productionBrowserSourceMaps: true,
};

export default nextConfig;
