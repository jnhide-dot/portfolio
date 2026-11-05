// Run the unchanged Python calculator off the UI thread. Each run gets a fresh worker.
import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.mjs';
self.onmessage = async ({data}) => {
  try {
    self.postMessage({status:'계산기를 불러오는 중… 첫 실행은 잠시 걸릴 수 있습니다.'});
    const py = await loadPyodide();
    const response = await fetch('./engine.zip');
    if (!response.ok) throw new Error('계산 자료를 불러오지 못했습니다.');
    py.unpackArchive(await response.arrayBuffer(), 'zip', {extractDir:'/simulator'});
    py.globals.set('request_json', JSON.stringify(data));
    self.postMessage({status:'두 편성을 계산하고 있습니다.'});
    const result = await py.runPythonAsync(`
import sys, json, io, contextlib
sys.path.insert(0, '/simulator/app')
import worker
messages = io.StringIO()
with contextlib.redirect_stdout(messages):
    result = worker.compare(json.loads(request_json))
result['engine_messages'] = messages.getvalue()
json.dumps(result, ensure_ascii=False, allow_nan=False)
`);
    self.postMessage({result: JSON.parse(result)});
  } catch (error) {
    console.error(error);
    const message = String(error.message || error).trim().split('\n').at(-1);
    self.postMessage({error: '계산을 완료하지 못했습니다. ' + message});
  }
};
