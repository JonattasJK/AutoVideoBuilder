const path = require('path')

const robots = {
    userInput: require(path.join(__dirname, 'robots', 'user-input.js')),
    text: require(path.join(__dirname, 'robots', 'text.js')),
    state: require(path.join(__dirname, 'robots', 'state.js'))
}

async function start() {

    robots.userInput()
    await robots.text()

    const content = robots.state.load()
    console.dir(content, { depth: null })
}

start()