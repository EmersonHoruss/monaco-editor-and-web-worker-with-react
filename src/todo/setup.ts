import * as monaco from "monaco-editor";
import { monarch } from "./monarch";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { editor } from "monaco-editor";

const languageID: string = "todo";
const languageExtensionPoint: monaco.languages.ILanguageExtensionPoint = {
  id: languageID,
};
export function setup() {
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      console.log(label);
      if (label === "json") {
        return new jsonWorker();
      }
      if (label === "css" || label === "scss" || label === "less") {
        return new cssWorker();
      }
      if (label === "html" || label === "handlebars" || label === "razor") {
        return new htmlWorker();
      }
      if (label === "typescript" || label === "javascript") {
        return new tsWorker();
      }
      return new editorWorker();
    },
  };

  const worker = new Worker(new URL("./todo.worker.ts", import.meta.url));
  let id = 0;
  /** @type {Map<string, {resolve: ()=>void, reject: ()=>void}>} */
  const messageMap = new Map();
  worker.onmessage = function (e) {
    console.log("Main: Receiving message", e.data);
    const promise = messageMap.get(e.data.id);
    if (promise) {
      messageMap.delete(e.data.id);
      if (e.data.success) promise.resolve(e.data.data);
      else promise.reject(e.data.data);
    }
  };
  monaco.languages.register(languageExtensionPoint);
  monaco.languages.registerCompletionItemProvider(languageID, {
    provideCompletionItems(
      model: editor.ITextModel,
      position: monaco.Position,
      _context: monaco.languages.CompletionContext,
      _token: monaco.CancellationToken
    ) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const currentId = ++id;
      const promise = new Promise((resolve, reject) => {
        messageMap.set(currentId, { resolve, reject });
      });
      worker.postMessage({ id: currentId, data: textUntilPosition });
      return promise;
    },
    resolveCompletionItem(item: any, _token: any) {
      return item;
    },
  });
  // monaco.languages.onLanguage(languageID, () => {
  //   monaco.languages.setMonarchTokensProvider(languageID, monarch);
  // });
}
