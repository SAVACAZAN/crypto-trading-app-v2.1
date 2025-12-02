/**
 * Vite Plugin to Handle CCXT Import Errors
 * Only blocks CCXT on CLIENT-SIDE, allows SERVER-SIDE usage
 */

export default function externalizeNodeDeps() {
  return {
    name: 'externalize-node-deps',
    enforce: 'pre',

    config(config, { command, mode }) {
      // Only apply to client build, not SSR
      return {
        resolve: {
          alias: {
            // Prevent client-side code from importing these
            'http-proxy-agent': 'data:text/javascript,export default {}',
            'https-proxy-agent': 'data:text/javascript,export default {}',
            'socks-proxy-agent': 'data:text/javascript,export default {}',
          }
        }
      };
    },

    resolveId(id, importer, options) {
      // Only block on client-side (when it's NOT SSR)
      if (options && options.ssr) {
        // Allow everything on server-side
        return null;
      }

      // Block proxy agents on client-side
      if (id === 'http-proxy-agent' || id === 'https-proxy-agent' || id === 'socks-proxy-agent') {
        return {
          id: 'data:text/javascript,export default {}',
          external: false
        };
      }

      return null;
    }
  };
}