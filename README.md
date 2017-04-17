# Revision replace plugin
- A webpack plugin to replace assets with their revisioned versions in static files
- To be used with:
  - (Manifest revision plugin)[https://github.com/nickjj/manifest-revision-webpack-plugin]
  - (Manifest format helper)[https://www.npmjs.com/package/@practo/manifest-revision-formatter-webpack]

# Usage
```
..
..
const RevReplacePlugin = require('@practo/rev-replace-plugin');
..
..
new RevReplacePlugin({
  manifest: resolve('./build-dir', 'manifest.json'), // manifest source
  output: resolve('./build-dir') // output for revisioned assets ( paths from manifest are maintained )
})
..
..

```
