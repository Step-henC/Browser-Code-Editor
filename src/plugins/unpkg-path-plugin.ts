import * as esbuild from 'esbuild-wasm';
import axios from 'axios'
 
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin', //property just for debugging
    setup(build: esbuild.PluginBuild) { //called automatically by esbuild
      build.onResolve({ filter: /.*/ }, async (args: any) => { //onResolve event listener looks for where file is stored and overrides esbuilds native way of finding files
        console.log('onResolve', args);
        if (args.path === 'index.js'){
          return { path: args.path, namespace: 'a' };
        } 

        if (args.path.includes('./') || args.path.includes('../')){
          return {
            namespace: 'a',
            //args.path has url subdir and importer has import domain. need forward slash so that up one dir (../) does
            //NOT replace domain
            path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href //built in Browser constructor to build urls
          }
        }


        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }
        
        // else if (args.path === 'tiny-test-pkg'){
        //   return {path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js', namespace: 'a'} //we can use arg.spath in the onLoad func
        // }
         //namespace is for set of files to say only apply overrides (onRes, onLoad) to these files
      });
 
      build.onLoad({ filter: /.*/ }, async (args: any) => { //tell esbuild not look on file system
        console.log('onLoad', args);
 
        if (args.path === 'index.js') { //if attempting to load the entryfile
          return { //just load this file here
            loader: 'jsx', //if anny import/require/exports figure out where that file is
            contents: `
              const react = require('react'); 
              console.log(react);
            `,
          };
        } 

        const {data, request} = await axios.get(args.path);
        return {
          loader: 'jsx',
          contents: data,
          //request object shows redirects from unpkg that unpkg does to lead us to entry file
         resolveDir: new URL('./', request.responseURL).pathname//will be provided to next file in a nested require statement. It identifies where we found the main entry file (index.js)
        }
      });
    },
  };
};