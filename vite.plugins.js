/**
 * Plugin to ensure hot reload of markdown sources
 *
 * @module vite.plugins.js
 * @exports {Function} MarkdownHotReload
 * @author Darryl Cousins <cousinsd@proton.me>
 */

export function MarkdownHotReload() {
  return {
    name: 'md-hot-reload',
    enforce: 'post',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.md')) {
        console.log('reloading md file...');

        server.ws.send({
          type: 'full-reload',          
          path: '*'
        });
      };
    },
  };
};
