(function() {
  const currentScript = document.currentScript;
  if (!currentScript) return;

  const targetHost = currentScript.getAttribute('data-target-host') || 'api.furry.ist';
  const allowedHostsText = currentScript.getAttribute('data-allowed-hosts') || 'sni-api.furry.ist,api.furry.ist,web.archive.org,localhost,127.0.0.1';
  const allowedHosts = allowedHostsText.split(',').map(item => item.trim()).filter(Boolean);
  const currentHost = window.location.hostname;

  if (!allowedHosts.includes(currentHost)) {
    const newUrl = window.location.href.replace(currentHost, targetHost);
    window.location.replace(newUrl);
  }
})();