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
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm' //originally copies esbuild.wasm from node_modules into public dir, but now user pays for cost of downloading from unpkg.com
    })

    //use service for its transform function
  }
  const onClick = async () => {
   if (!ref.current){ //make sure service started
      return;
   }

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

   setCode(result.outputFiles[0].text);

   //execute JS code by using browser-built-in eval()
   try {
    eval(result.outputFiles[0].text)

   } catch( err) {
    alert(err)
   }
  }

  useEffect(() => {
startService() //start service once on render

  }, [])
  return <div style={{display: 'flex', flexDirection: 'column'}}>
    <textarea style={{minHeight: '7em', width: '70%'}} value={input} onChange={(e) => setInput(e.target.value)}></textarea>
    <button style={{width: '5em', height: '3em'}} onClick={onClick}>Submit</button>
    <pre>{code}</pre>
    {/* since we do not want direct access from parent to child iframe we MUST have a sandbox property and it cannot say "allow-same-origin" */}
    {/* iframe also has direct access if we fetch parent html and iframe htm from same domain, port, protocol if all conditions are true */}
    {/* codepen and codesandbox uses sandbox='allow-same-origin' but loads up child frame from a different domain */}
    <iframe sandbox="" src='/test.html'></iframe>
    </div>
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);