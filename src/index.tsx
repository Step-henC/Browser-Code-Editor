import * as esbuild from 'esbuild-wasm'
import React, {useState, useEffect, useRef} from "react";
import ReactDOM from "react-dom/client";
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';




const App = () => {
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const ref = useRef<any>(null)

  const startService = async () => {
    ref.current = await esbuild.startService({ //we can use a ref to get the service everywhere
      worker: true,
      wasmURL: './esbuild.wasm' //copied from node_modules
    })

    //use service for its transform function
  }
  const onClick = async () => {
   if (!ref.current){ //make sure service started
      return;
   }

  //  const result = await ref.current.transform(input, {
  //   loader: 'jsx',//tell esbuild what kind of code we are providing
  //   target: 'es2015' //tell what version of js we want esbuild for browser interpretation
  //  })

  const result = await ref.current.build({
    entryPoints: ['index.js'],
    bundle: true,
    write: false,
    plugins: [unpkgPathPlugin(), fetchPlugin(input)], //all plugins are ran in order listed
    //add define property to suppress warnings. When getting pkgs like React, they need these properties defined
    //have to replace with STRING of production hence teh double quotes
    //the global substitution is done in webpack automatically, here for housekeeping
    define: {
      'process.env.NODE_ENV': '"production"', 
      global: 'window'
    }
  })
  console.log(result)

   setCode(result.outputFiles[0].text)
  }

  useEffect(() => {
startService() //start service once on render

  }, [])
  return <div>
    <textarea value={input} onChange={(e) => setInput(e.target.value)}></textarea>
    <button onClick={onClick}>Submit</button>
    <pre>{code}</pre>
    </div>
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);