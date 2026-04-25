import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isMobile = process.env.BUILD_TARGET === 'mobile';

/** @type {import('next').NextConfig} */
const nextConfig = isMobile
  ? {
      output: 'export',
      distDir: 'out',
      images: { unoptimized: true },
      trailingSlash: true,
      eslint: { ignoreDuringBuilds: true },
      typescript: { ignoreBuildErrors: true },
    }
  : {
      output: 'standalone',
      outputFileTracingRoot: __dirname,
    };

export default nextConfig;
