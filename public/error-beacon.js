(() => {
  const ENDPOINT = '/api/log-error';

  function send(payload) {
    try {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(ENDPOINT, {
          method: 'POST',
          body: body,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
        });
      }
    } catch (_e) {
      // Beacon failing silently beats a beacon that throws and creates a new error to report.
    }
  }

  window.addEventListener('error', (e) => {
    send({
      type: 'error',
      message: e.message,
      source: e.filename,
      line: e.lineno,
      col: e.colno,
      stack: e.error?.stack,
      url: location.href,
      ua: navigator.userAgent,
      ts: Date.now(),
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    send({
      type: 'unhandledrejection',
      message: reason?.message ? reason.message : String(reason),
      stack: reason?.stack,
      url: location.href,
      ua: navigator.userAgent,
      ts: Date.now(),
    });
  });
})();
