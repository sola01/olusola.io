addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Extract user information from request headers
  const email = request.headers.get('cf-access-user-email');
  const timestamp = new Date().toUTCString();
  const country = request.headers.get('cf-ipcountry');
  const countryCode = country.toLowerCase();
  
  // R2 bucket URL for the country flag
  const imageUrl = `https://6899b8bd6a48789bc7dfc68a59dcd50b.r2.cloudflarestorage.com/countryflags${countryCode}.svg`;

  // Construct the response body with HTML link and image
  const responseHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>User Information</title>
    </head>
    <body>
      <p>${email} authenticated at ${timestamp} from 
      <a href="https://tunnel.olusola.io/secure/${country}">
        ${country}
      </a>
      <br>
      <img src="${imageUrl}" alt="${country}">
      </p>
    </body>
    </html>
  `;

  return new Response(responseHTML, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}
