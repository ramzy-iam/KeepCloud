const { composePlugins, withNx } = require('@nx/webpack');

module.exports = composePlugins(withNx(), (config) => {
  // Bundle all node_modules into the output (no externals)
  config.externals = [];

  // Disable code splitting - produce a single bundle file
  config.optimization = {
    ...config.optimization,
    splitChunks: false,
    runtimeChunk: false,
  };

  // Silence warnings about dynamic requires
  config.module.exprContextCritical = false;

  // Mock optional NestJS modules to avoid "module not found" errors
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      '@nestjs/websockets/socket-module': false,
      '@nestjs/microservices': false,
      '@nestjs/microservices/microservices-module': false,
    },
  };

  return config;
});
