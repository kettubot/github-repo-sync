const http = require('http')
const crypto = require('crypto')
const exec = require('child_process').exec
const config = require('./config.json')

http.createServer((req, res) => {
  function closeWith (code, message = '') {
    res.statusCode = code
    res.statusMessage = message
    return res.end()
  }

  if (req.method !== 'POST') return closeWith(405, 'Method Not Allowed')

  let data = ''
  req.on('data', chunk => data += chunk)

  req.on('end', () => {
    const json = JSON.parse(data)

    const target = config.repos.find(r => r.name === json.repository.name)
    if (!target) return closeWith(404, 'Not Found')

    const signature = 'sha1=' + crypto.createHmac('sha1', target.secret).update(data).digest('hex')
    if (req.headers['x-hub-signature'] !== signature) return closeWith(403, 'Forbidden')

    if (json.action?.toLowerCase() !== 'push') return closeWith(304, 'Not Modified')
    if (json.ref !== 'refs/heads/' + target.branch) return closeWith(304, 'Not Modified')

    exec(config.script.replace('{path}', target.path))

    return closeWith(200, 'OK')
  })
}).listen(config.port)