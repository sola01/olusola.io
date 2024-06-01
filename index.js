addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/secure/')) {
    // Handle country-specific flag image requests
    const countryCode = url.pathname.split('/secure/')[1].toLowerCase();
    if (countryCode) {
      return serveFlagImage(countryCode);
    } else {
      return new Response('Country code not provided', { status: 400 });
    }
  } else if (url.pathname === '/secure') {
    // Handle the /secure path
    return serveSecurePage(request);
  } else {
    return new Response('Not Found', { status: 404 });
  }
}

async function serveSecurePage(request) {
  // Extract user information from request headers
  const email = request.headers.get('cf-access-user-email');
  const timestamp = new Date().toUTCString();
  const country = request.headers.get('cf-ipcountry');
  const countryCode = country.toLowerCase();

  // Construct URL for flag image stored in private R2 bucket
  const flagURL = `https://tunnel.olusola.io/secure/${countryCode}`;

  // Construct the response body with HTML link and image
  const responseHTML = `
    <html>
      <body>
        <p>${email} authenticated at ${timestamp} from 
        <a href="${flagURL}">
          <img src="${flagURL}" alt="${country}">
        </a></p>
      </body>
    </html>
  `;

  return new Response(responseHTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

async function serveFlagImage(countryCode) {
  // R2 bucket details
  const bucketName = R2_BUCKET_NAME;
  const objectKey = `${countryCode}.png`;

  // Fetch the flag image from R2
  const response = await fetch(`https://${bucketName}.r2.cloudflarestorage.com/${objectKey}`, {
    headers: {
      'Authorization': `Bearer ${R2_API_TOKEN}`,
    }
  });

  if (!response.ok) {
    return new Response('Flag image not found', { status: 404 });
  }

  // Return the flag image with the correct content type
  return new Response(response.body, {
    status: 200,
    headers: {
      'Content-Type': 'image/png'
    }
  });
}
