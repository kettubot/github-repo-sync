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

    const target = config.repos.find(r => r.name === json.repository.name && json.ref === 'refs/heads/' + r.branch)
    if (!target) return closeWith(404, 'Not Found')

    const signature = 'sha1=' + crypto.createHmac('sha1', target.secret).update(data).digest('hex')
    if (req.headers['x-hub-signature'] !== signature) return closeWith(403, 'Forbidden')

    if (json.zen) {
      console.log('Ping! ' + json.zen)
      return closeWith(200, 'OK')
    }

    if (req.headers['x-github-event'] !== 'push') return closeWith(304, 'Not Modified')

    const script = target.script || config.script

    exec(script.split('{path}').join(target.path))

    return closeWith(200, 'OK')
  })
}).listen(config.port, () => console.log('github-repo-sync online at :' + config.port))