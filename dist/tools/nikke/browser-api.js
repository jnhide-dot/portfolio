// Preserve the existing UI's API contract without a server or localhost dependency.
(() => {
  const nativeFetch = window.fetch.bind(window);
  const base = new URL('./', document.currentScript.src);
  let running = false;
  window.fetch = (input, options = {}) => {
    if (input === '/catalog' || input === '/defaults') {
      return nativeFetch(new URL(input.slice(1) + '.json', base), options);
    }
    if (input !== '/simulate') return nativeFetch(input, options);
    if (running) return Promise.resolve(Response.json({error:'이미 계산 중입니다.'}, {status:409}));
    running = true;
    return new Promise(resolve => {
      const status = document.getElementById('runtimeStatus');
      const cancel = document.getElementById('cancelCalculation');
      let worker, timeout, finished = false;
      const finish = (body, code = 200) => {
        if (finished) return;
        finished = true; running = false;
        clearTimeout(timeout); worker?.terminate();
        cancel.hidden = true; cancel.onclick = null;
        status.textContent = code === 200 ? '계산 완료 · 결과는 이 브라우저에만 표시됩니다. 필요하면 결과 내보내기를 눌러주세요.' : body.error;
        resolve(Response.json(body, {status:code}));
      };
      try {
        const request = JSON.parse(options.body);
        worker = new Worker(new URL('calculation-worker.js', base), {type:'module'});
        cancel.hidden = false;
        cancel.onclick = () => finish({error:'계산을 취소했습니다. 설정을 바꿔 다시 실행할 수 있습니다.'}, 499);
        worker.onmessage = ({data}) => {
          if (data.status) status.textContent = data.status;
          else if (data.error) finish({error:data.error}, 500);
          else finish({...data.result, run_id:'browser-' + Date.now()});
        };
        worker.onerror = () => finish({error:'계산기를 불러오지 못했습니다. 인터넷 연결을 확인하고 다시 실행해 주세요.'}, 500);
        timeout = setTimeout(() => finish({error:'계산 시간이 초과되었습니다. 전투 시간을 줄여 다시 실행해 주세요.'}, 504), 300000);
        worker.postMessage(request);
      } catch (error) { finish({error:error.message}, 400); }
    });
  };
})();
