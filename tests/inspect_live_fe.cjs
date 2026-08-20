const https = require('https');

https.get('https://indochinese-restaurant.onrender.com', (res) => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    console.log('HTML Status:', res.statusCode);
    console.log('HTML Content:\n', html);
    const regex = /<script\s+type="module"\s+crossorigin\s+src="([^"]+)">/i;
    const match = html.match(regex);
    if (match) {
      const jsPath = match[1];
      console.log('JS Path:', jsPath);
      const jsUrl = jsPath.startsWith('http') ? jsPath : 'https://indochinese-restaurant.onrender.com' + (jsPath.startsWith('/') ? '' : '/') + jsPath;
      https.get(jsUrl, (jres) => {
        let js = '';
        jres.on('data', j => js += j);
        jres.on('end', () => {
          console.log('JS Bundle Status:', jres.statusCode, 'Length:', js.length);
        });
      });
    }
  });
});
