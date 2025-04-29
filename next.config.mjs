/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'media.licdn.com', // LinkedIn media domain
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**.licdn.com',
        },
      ],
    },
  };
  
  export default nextConfig;