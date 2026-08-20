const https = require('https');

https.get('https://indochinese-restaurant.onrender.com', (res) => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    console.log('HTML Length:', html.length);
    console.log('HTML Snippet:', html.substring(0, 500));

    // Find script tags
    const scriptMatches = [...html.matchAll(/src=["']([^"']+\.js)["']/g)].map(m => m[1]);
    console.log('Script files:', scriptMatches);

    if (scriptMatches.length > 0) {
      const scriptUrl = 'https://indochinese-restaurant.onrender.com' + (scriptMatches[0].startsWith('/') ? '' : '/') + scriptMatches[0];
      console.log('Fetching JS:', scriptUrl);
      https.get(scriptUrl, (jsRes) => {
        let js = '';
        jsRes.on('data', d => js += d);
        jsRes.on('end', () => {
          console.log('JS Status:', jsRes.statusCode, '| JS Length:', js.length);
        });
      });
    }
  });
});
