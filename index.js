const qr = require("qr-image")

const landing = `<h1>Wi-Fi QR Code Generator</h1>
<p>You can easily Wi-Fi QR Code from your terminal.</p>
<code>curl -X POST -d ssid=your-ssid -d pass=your-pass https://qrcode.proelbtn.com</code>
`


async function getContentType(request) {
  for (let key of ["content-type", "Content-Type"]) {
    if (request.headers.has(key)) return request.headers.get(key)
  }
  return null
}


async function generate(request) {
  const contentType = await getContentType(request)
  console.log(contentType)

  let type = "WPA"
  let ssid = "mynetwork"
  let pass = "mypassword"
  let hidden = false

  if (contentType == "application/x-www-form-urlencoded") {
    const body = await request.formData()

    type = body.get("type") || type
    ssid = body.get("ssid") || ssid
    pass = body.get("pass") || pass
    hidden = body.get("hidden") || hidden
  }
  else if (contentType == "application/json") {
    const body = await request.json()

    type = body.type || type
    ssid = body.ssid || ssid
    pass = body.pass || pass
    hidden = body.hidden || hidden
  }
  else return new Response("", { status: 403 })

  const msg = "WIFI:T:" + type + ";S:" + ssid + ";P:" + pass + ";H:" + hidden + ";"

  const qr_png = qr.imageSync(msg)
  
  return new Response (qr_png, {
    headers: {
      "Content-Type": "image/png"
    },
  })
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === "POST") {
    return await generate(request)
  }
  return new Response(landing, {
    headers: { 'content-type': 'text/html' },
  })
}
