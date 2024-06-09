import {useRef} from 'react'
import MonacoEditor, {EditorDidMount} from '@monaco-editor/react';
import prettier from 'prettier'
import parser from 'prettier/parser-babel'

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void
} 
const CodeEditor: React.FC<CodeEditorProps> = ({initialValue, onChange}) => {
  const editorRef = useRef<any>()
  const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
    editorRef.current = monacoEditor;
   monacoEditor.onDidChangeModelContent(() => {
    onChange(getValue())
   });

   monacoEditor.getModel()?.updateOptions({tabSize: 2})
  }

  const onFormatClick = () => {
    //get current val from editor
    const unformatted = editorRef.current.getModel().getValue();
    //formate value
    const formatted = prettier.format(unformatted, { //tell it treat as JS and here's the parser we want you to use
      parser: 'babel',
      plugins: [parser],
      useTabs: false,
      semi: true,
      singleQuote: true
    })
    //set formatted value back in editor
    editorRef.current.setValue(formatted)
  }
  return (
    <div>

<button onClick={onFormatClick}>Format</button>
  
    <MonacoEditor
      value={initialValue}
      editorDidMount={onEditorDidMount}
      options={{
        wordWrap: 'on',
        minimap: { enabled: false },
        showUnused: false,
        folding: false,
        lineNumbersMinChars: 3,
        fontSize: 16,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      height="500px"
      language="javascript"
      theme="dark"
    />
      </div>
  );
};

export default CodeEditor;
