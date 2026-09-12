import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  globalIgnores([
    'dist/**',
    'node_modules/**',
    'migrations/**',
    'src/prisma/contract.d.ts',
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,
);