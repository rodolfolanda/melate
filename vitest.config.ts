import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/run-*.ts', // Exclude runner files
        'src/**/*.d.ts',
        '**/__tests__/**',
        '**/update-lottery-data.ts', // Exclude CLI utility script
      ],
      // Coverage thresholds - consistent and achievable goals
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
