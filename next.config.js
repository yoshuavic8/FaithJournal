/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com', 'tripay.co.id'],
    },
    // Explicitly set output to ensure Vercel recognizes this as a Next.js project
    output: 'standalone',
    // Explicitly set distDir to ensure Vercel knows where to look for the build output
    distDir: '.next'
};

// Only include tempo configuration in development mode
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_TEMPO) {
    nextConfig.experimental = {
        swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]]
    };
}

module.exports = nextConfig;