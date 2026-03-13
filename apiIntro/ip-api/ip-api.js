function queryIP(ip = null, db = null) {
  const ipInput = document.getElementById('ip-input');
  const dbSelect = document.getElementById('db-select');
  const ipToQuery = ip || ipInput.value;
  const dbToQuery = db || (dbSelect ? dbSelect.value : '');
  const resultDiv = document.getElementById('query-result');
  const resultContent = document.getElementById('result-content');

  let url = 'https://sni-api.furry.ist/ipapi';
  if (ipToQuery) {
    url += '/' + encodeURIComponent(ipToQuery.trim());
  }

  if (dbSelect && db !== null) {
    dbSelect.value = db;
  }

  if (dbToQuery) {
    url += `?db=${encodeURIComponent(dbToQuery)}`;
  }

  resultContent.textContent = '加载中... / Loading...';
  resultDiv.classList.add('active');

  fetch(url)
    .then(response => response.json())
    .then(data => {
      resultContent.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      resultContent.textContent = '错误 / Error: ' + error.message;
    });
}