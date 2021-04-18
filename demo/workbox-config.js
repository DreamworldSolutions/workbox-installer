export default {
  navigateFallback: 'index.html',
  clientsClaim: true,
  globDirectory: 'build',
  globPatterns: [
    '**/*.{html,json,js,css}',
  ],
  swDest: 'build/service-worker.js',
};