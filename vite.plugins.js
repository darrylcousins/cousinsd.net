/**
 * Plugin to ensure hot reload of markdown sources
 *
 * @module vite.plugins.js
 * @exports {Function} SourcesHotReload
 * @author Darryl Cousins <cousinsd@proton.me>
 */

export function SourcesHotReload() {
  return {
    name: 'sources-hot-reload',
    enforce: 'post',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.md') || file.endsWith('.json')) {
        console.log('reloading file...');

        server.ws.send({
          type: 'full-reload',          
          path: '*'
        });
      };
    },
  };
};
