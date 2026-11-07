(function() {
  const currentScript = document.currentScript;
  if (!currentScript) return;

  const targetHost = currentScript.getAttribute('data-target-host') || 'api.furry.ist';
  const allowedHostsText = currentScript.getAttribute('data-allowed-hosts') || 'sni-api.furry.ist,api.furry.ist,web.archive.org,localhost,127.0.0.1,*.furryapi.pages.dev';
  const allowedHosts = allowedHostsText.split(',').map(item => item.trim()).filter(Boolean);
  const currentHost = window.location.hostname;

  const isAllowed = allowedHosts.some(function(entry) {
    if (entry.startsWith('*.')) {
      const suffix = entry.slice(1); // e.g. ".furryapi.pages.dev"
      return currentHost.endsWith(suffix);
    }
    return currentHost === entry;
  });

  if (!isAllowed) {
    const newUrl = window.location.href.replace(currentHost, targetHost);
    window.location.replace(newUrl);
  }
})();