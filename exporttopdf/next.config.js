/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      config.module.rules.push({
        test: /\.map$/,
        use: 'ignore-loader',
      });
  
      if (!isServer) {
        config.externals.push({
          'chrome-aws-lambda': 'commonjs chrome-aws-lambda',
        });
      }
  
      return config;
    },
  };
  
  module.exports = nextConfig;