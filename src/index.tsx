import * as esbuild from 'esbuild-wasm'
import React, {useState, useEffect, useRef} from "react";
import ReactDOM from "react-dom/client";


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

   const result = await ref.current.transform(input, {
    loader: 'jsx',//tell esbuild what kind of code we are providing
    target: 'es2015' //tell what version of js we want esbuild for browser interpretation
   })

   setCode(result.code)
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