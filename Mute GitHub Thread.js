function header(message) {
  return message.headers().find(unsubscribe)
}

function unsubscribe(header) {
  return header.name().toLowerCase() === 'list-unsubscribe'
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

function mute(url) {
  app().doShellScript('curl ' + url + ' &> /dev/null &')
}

function announce(messages) {
  var label = (messages.length === 1) ? 'conversation' : 'conversations'
  var text = messages.length + ' ' + label + ' muted.'
  app().displayNotification(text, {withTitle: 'Thread Muted'})
}

function run(input, parameters) {
  var app = Application('Mail')
  var messages = app.selection()

  messages
    .map(header)
    .filter(compact)
    .map(urls)
    .reduce(flatten, [])
    .map(clean)
    .filter(http)
    .forEach(mute)

  announce(messages)
}

