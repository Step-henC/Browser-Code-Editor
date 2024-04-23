import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin', //property just for debugging
    setup(build: esbuild.PluginBuild) {
      //called automatically by esbuild

      //handle root entry file of index.js
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: 'index.js', namespace: 'a' };
      });

      //handler relative paths in module
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          //args.path has url subdir and importer has import domain. need forward slash so that up one dir (../) does
          //NOT replace domain
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href, //built in Browser constructor to build urls
        };
      });

      //handle main file of a module
      build.onResolve(
        {
          filter: /.*/,
        },
        async (args: any) => {
          return {
            namespace: 'a',
            path: `https://unpkg.com/${args.path}`,
          };
        }
      );
    },
  };
};
