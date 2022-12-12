import { SourcesHotReload } from "./vite.plugins.js";

export default {
  plugins: [ SourcesHotReload() ],
  esbuild: {
    jsxFactory: 'createElement',
    jsxFragment: 'Fragment'
  },
  server: {
    port: 3332,
  },
};

