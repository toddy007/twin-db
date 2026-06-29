import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,          // gera os .d.ts para TypeScript
  clean: true,        // limpa dist/ antes de buildar
  sourcemap: true,
});