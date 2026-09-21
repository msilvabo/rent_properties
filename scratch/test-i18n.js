const http = require('http');

function fetchPage(cookie) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      headers: cookie ? { Cookie: cookie } : {},
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- TEST 1: Default (No Cookie) ---');
  const defaultHtml = await fetchPage();
  const langMatch = defaultHtml.match(/<html[^>]*lang="([^"]*)"/);
  console.log('Detected <html lang>: ', langMatch ? langMatch[1] : 'none');
  console.log('Contains "Comprar": ', defaultHtml.includes('Comprar'));
  console.log('Contains "Encuentra tu": ', defaultHtml.includes('Encuentra tu'));
  console.log('Contains "santuario": ', defaultHtml.includes('santuario'));

  console.log('\n--- TEST 2: English Cookie (luxe_locale=en) ---');
  const enHtml = await fetchPage('luxe_locale=en');
  const enLangMatch = enHtml.match(/<html[^>]*lang="([^"]*)"/);
  console.log('Detected <html lang>: ', enLangMatch ? enLangMatch[1] : 'none');
  console.log('Contains "Buy": ', enHtml.includes('Buy'));
  console.log('Contains "Find your": ', enHtml.includes('Find your'));
  console.log('Contains "sanctuary": ', enHtml.includes('sanctuary'));

  console.log('\n--- TEST 3: French Cookie (luxe_locale=fr) ---');
  const frHtml = await fetchPage('luxe_locale=fr');
  const frLangMatch = frHtml.match(/<html[^>]*lang="([^"]*)"/);
  console.log('Detected <html lang>: ', frLangMatch ? frLangMatch[1] : 'none');
  console.log('Contains "Acheter": ', frHtml.includes('Acheter'));
  console.log('Contains "Trouvez votre": ', frHtml.includes('Trouvez votre'));
  console.log('Contains "sanctuaire": ', frHtml.includes('sanctuaire'));
}

run().catch(console.error);
