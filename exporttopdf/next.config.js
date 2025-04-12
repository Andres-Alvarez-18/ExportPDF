/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      config.module.rules.push({
        test: /\.map$/,
        use: 'ignore-loader',
      });

      return config;
    },
  };
  
  module.exports = nextConfig;
  