import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import copy from 'rollup-plugin-copy';
import { generateSW }  from 'rollup-plugin-workbox';
import workboxConfig from './workbox-config.js';

// Static assets will vary depending on the application
const copyConfig = {
  targets: [
    { src: 'node_modules/@webcomponents', dest: 'build/node_modules' },
    { src: 'src/images', dest: 'build' },
    { src: 'src/index.html', dest: 'build' },
  ],
};

// The main JavaScript bundle for modern browsers that support
// JavaScript modules and other ES2015+ features.
const config = {
  input: 'src/components/demo-app.js',
  output: {
    dir: 'build/components',
    format: 'es',
  },
  plugins: [
    minifyHTML(),
    copy(copyConfig),
    resolve(),
    generateSW(workboxConfig)
  ]
};

if (process.env.NODE_ENV !== 'development') {
  config.plugins.push(terser());
}

export default config;