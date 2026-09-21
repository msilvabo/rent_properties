const http = require('http');

function fetchPage(path, cookie) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
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
  console.log('--- TEST: Property detail page (/properties/villa-serena) ---');
  const esProp = await fetchPage('/properties/villa-serena', 'luxe_locale=es');
  console.log('[ES] Contains "Volver a propiedades":', esProp.includes('Volver a propiedades'));
  console.log('[ES] Contains "Calcular hipoteca":', esProp.includes('Calcular hipoteca'));

  const enProp = await fetchPage('/properties/villa-serena', 'luxe_locale=en');
  console.log('[EN] Contains "Back to homes":', enProp.includes('Back to homes'));
  console.log('[EN] Contains "Calculate Mortgage":', enProp.includes('Calculate Mortgage'));

  const frProp = await fetchPage('/properties/villa-serena', 'luxe_locale=fr');
  console.log('[FR] Contains "Retour aux propriétés":', frProp.includes('Retour aux propriétés'));
  console.log('[FR] Contains "Calculer l\'hypothèque":', frProp.includes("Calculer l'hypothèque") || frProp.includes("Calculer l&#39;hypothèque"));
}

run().catch(console.error);
