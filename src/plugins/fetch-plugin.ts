import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localForage from 'localforage';


const fileCache = localForage.createInstance({
  name: 'filecache',
}); //for browsers without indexeDB or WebSQL we can default to localforage for caching npm packages
export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild){
    build.onLoad({ filter: /.*/ }, async (args: any) => {
      //tell esbuild not look on file system

      if (args.path === 'index.js') {
       
        //if attempting to load the entry.csfile
        return {
          //just load this file here
          loader: 'jsx', //if anny import/require/exports figure out where that file is
          contents: `
           ${inputCode}
          `,
        };
      }

      // const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
      //   args.path
      // );

      // if (cachedResult) {
      //   return cachedResult;
      // }

      const { data, request } = await axios.get(args.path);

      const fileType = args.path.match(/.css$/) ? 'css' : 'jsx'

      const escaped = data //css cannot be injected raw into single quotes below because chars in file can interrupt single quotes surround variable
          .replace(/\n/g, '') //escape new line characters in css file
          .replace(/"/g, '\\"') //escape double quotes
          .replace(/'/g, "\\'") //escape single quotes
          //place all css file on a single line
          //according to esbuild, fix will not work with css files with import statements or font-style files but good prototype

      const contents = fileType === 'css' ?
      `const style = document.createElement('style');
      style.innerText = '${escaped}'
      document.head.appendChild(style);
      `: data; //esbuild when encountering css will build two files, an output JS file and output CSS file
      //esbuild does not know where to write the second output CSS file
      //we are wrapping the output CSS into JS so all is in one output JS file
      //if no css just use data as contents

      const result: esbuild.OnLoadResult = {
        loader: 'jsx',
        contents: contents,
        //request object shows redirects from unpkg that unpkg does to lead us to entry file
        resolveDir: new URL('./', request.responseURL).pathname, //will be provided to next file in a nested require statement. It identifies where we found the main entry file (index.js)
      };

      await fileCache.setItem(args.path, result);
      return result;
    });
    }
  }
}