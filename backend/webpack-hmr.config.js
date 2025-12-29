module.exports = function (options, webpack) {
  // Handle externals - ensure it's an array format (webpack accepts arrays)
  const originalExternals = Array.isArray(options.externals)
    ? options.externals
    : options.externals
      ? [options.externals]
      : [];

  const externals = [
    /^bun:sqlite$/,
    ...originalExternals.map((ext) => {
      if (typeof ext === 'function') {
        return (data, callback) => {
          const request = data.request;
          if (
            request === 'prisma-adapter-bun-sqlite' ||
            request === 'bun:sqlite'
          ) {
            return callback(); // Bundle adapter, skip original for sqlite (already handled by regex)
          }
          return ext(data, callback);
        };
      }
      return ext;
    }),
  ].filter(
    (ext) => ext !== 'prisma-adapter-bun-sqlite' && ext !== 'bun:sqlite',
  );

  return {
    ...options,
    externals,
    externalsType: 'commonjs', // Force commonjs for all externals including regex ones
    resolve: {
      ...options.resolve,
      extensionAlias: {
        '.js': ['.ts', '.js'],
      },
    },
    module: {
      ...options.module,
      rules: [
        ...(options.module.rules || []),
        {
          test: /prisma\/generated/,
          include: [/prisma\/generated/],
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext',
                esModuleInterop: true,
              },
            },
          },
        },
      ],
    },
  };
};
