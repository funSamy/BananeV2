module.exports = function (options, webpack) {
  return {
    ...options,
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
