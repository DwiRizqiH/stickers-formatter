// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../src/internal/node-webpmux.d.ts' />

(async () => {
    await import('./default.js')
    await import('./crop.js')
    await import('./full.js')
    await import('./circle.js')
    await import('./rounded.js')
})().catch(console.error)
