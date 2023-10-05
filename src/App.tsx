import "./App.css";
import { Editor } from "./components/Editor/Editor";

function App() {
  return (
    <>
      try to type foobar to test customized worker.
      Open the console in devtools to check behavior of custom wbe worker.
      <Editor language={"todo"} />
    </>
  );
}

export default App;
