function header(message) {
  return headers(message).find(unsubscribe)
}

function unsubscribe(header) {
  return header.name().toLowerCase() === 'list-unsubscribe'
}

function replyTo(header) {
  return header.name().toLowerCase() === 'in-reply-to'
}

function compact(value) {
  return value !== undefined
}

function urls(header) {
  return header.content().split(',')
}

function clean(url) {
  return url.trim().replace(/[<>]/g, '')
}

function http(url) {
  return /^http/.test(url)
}

function app() {
  const app = Application.currentApplication()
  app.includeStandardAdditions = true
  return app
}

function curl(url) {
  return 'curl ' + url + ' &> /dev/null &'
}

function mute(commands) {
  if (commands.length) {
    app().doShellScript(commands.join("\n"))
  }
}

function announce(count) {
  const label = (count === 1) ? 'conversation' : 'conversations'
  const text = count + ' ' + label + ' muted.'
  app().displayNotification(text, {withTitle: 'Thread Muted'})
}

function groupBy(values, fn) {
  return values.reduce(function(groups, value) {
    const key = fn(value)
    groups[key] = groups[key] || []
    groups[key].push(value)
    return groups
  }, {})
}

function headers(message) {
  return message.allHeaders().trim().split("\n").map(function(line) {
    const [all, key, value] = line.trim().match(/([\w-]+):(.*)/)
    const name = () => key.trim()
    const content = () => value.trim()
    return {name, content}
  })
}

function thread(message) {
  const reply = headers(message).find(replyTo)
  return reply ? clean(reply.content()) : message.messageId()
}

function run(input, parameters) {
  const app = Application('Mail')
  const conversations = groupBy(app.selection(), thread)
  const messages = Object.keys(conversations).map(key => conversations[key][0])
  const commands = messages
    .map(header)
    .filter(compact)
    .flatMap(urls)
    .map(clean)
    .filter(http)
    .map(curl)

  mute(commands)
  announce(commands.length)
}
