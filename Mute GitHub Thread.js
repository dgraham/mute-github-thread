function header(message) {
  return message.headers().find(unsubscribe)
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

function flatten(values, value) {
  return values.concat(value)
}

function clean(url) {
  return url.trim().replace(/[<>]/g, '')
}

function http(url) {
  return /^http/.test(url)
}

function app() {
  var app = Application.currentApplication()
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
  var label = (count === 1) ? 'conversation' : 'conversations'
  var text = count + ' ' + label + ' muted.'
  app().displayNotification(text, {withTitle: 'Thread Muted'})
}

function groupBy(values, fn) {
  return values.reduce(function(groups, value) {
    var key = fn(value)
    groups[key] = groups[key] || []
    groups[key].push(value)
    return groups
  }, {})
}

function thread(message) {
  var reply = message.headers().find(replyTo)
  return reply ? clean(reply.content()) : message.messageId()
}

function run(input, parameters) {
  var app = Application('Mail')

  var conversations = groupBy(app.selection(), thread)
  var messages = Object.keys(conversations).map(function(key) {
    return conversations[key][0]
  })

  var commands = messages
    .map(header)
    .filter(compact)
    .map(urls)
    .reduce(flatten, [])
    .map(clean)
    .filter(http)
    .map(curl)

  mute(commands)
  announce(commands.length)
}
