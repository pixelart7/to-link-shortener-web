const axios = require('axios')
const { base64encode, base64decode } = require('nodejs-base64');

function parsePost (body) { // too simple that my prof will prob kill me
  const res = {};
  const splited = body.split('Content-Disposition: form-data;')
  splited.forEach((elm) => {
    try {
      elm = elm.replace(/[\n\r]/g, "$NL$")
      const name = elm.split('$NL$$NL$$NL$$NL$')[0].split('name="')[1].split('"')[0]
      const value = elm.split('$NL$$NL$$NL$$NL$')[1].split('$NL$$NL$')[0]
      res[name] = value
    } catch (e) {}
  })
  return res
}

exports.handler = async (event, context) => {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log(event)
  console.log(event.body)

  let body;
  if (event.isBase64Encoded) body = base64decode(event.body)
  else body = event.body
  const post = parsePost(body)
  console.log(post)

  let shortLink = ''
  if (post.short === '') {
    shortLink = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 3);
  } else {
    shortLink = post.short
  }

  const res = await axios.post(`https://kvdb.io/3B3pc1hjdDVThuWxJsVmbx/${encodeURI(shortLink)}?ttl=${encodeURI(post.ttl)}`, encodeURI(post.url))

  if (res.status === 200) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: encodeURI(post.url),
        short: encodeURI(shortLink),
        ttl: encodeURI(post.ttl)
      })
    };
  }
  return {
    statusCode: 500,
  };
};