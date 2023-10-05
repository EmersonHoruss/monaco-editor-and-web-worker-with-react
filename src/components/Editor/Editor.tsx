import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";

export const Editor: React.FC<any> = (props: any) => {
  const [, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const monacoElement = useRef(null);
  useEffect(() => {
    if (monacoElement) {
      setEditor((editor: monaco.editor.IStandaloneCodeEditor | null) => {
        if (editor) return editor;
        return monaco.editor.create(monacoElement.current!, {
          language: props.language,
        });
      });
    }
  }, [monacoElement.current]);
  return <div ref={monacoElement} style={{ height: "80vh", width: "80vw" }} />;
};
