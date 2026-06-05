const CLIENT_KEY = 'Mid-client-s1CqULUdvFsPm-Sg'
const SNAP_JS_URL = 'https://app.sandbox.midtrans.com/snap/snap.js'

export function buildSnapHtml(snapToken: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { background: #f5f5f5; }</style>
</head>
<body>
  <script src="${SNAP_JS_URL}" data-client-key="${CLIENT_KEY}"></script>
  <script>
    function post(type, data) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data || {} }));
    }
    window.addEventListener('load', function() {
      window.snap.pay('${snapToken}', {
        onSuccess: function(r) { post('success', r); },
        onPending: function(r) { post('pending', r); },
        onError:   function(r) { post('error', r); },
        onClose:   function()  { post('close'); }
      });
    });
  </script>
</body>
</html>`
}
