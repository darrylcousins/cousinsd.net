import { MarkdownHotReload } from "./vite.plugins.js";

export default {
  plugins: [ MarkdownHotReload() ],
  esbuild: {
    jsxFactory: 'createElement',
    jsxFragment: 'Fragment'
  },
  server: {
    port: 3332,
  },
};

