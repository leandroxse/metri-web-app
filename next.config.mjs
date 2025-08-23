/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuração para módulos nativos como SQLite
  webpack: (config, { isServer }) => {
    // Apenas no servidor permitimos módulos nativos
    if (!isServer) {
      // Não tenta resolver esses módulos no cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
}

export default nextConfig
