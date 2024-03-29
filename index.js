const path = require('path')

const robots = {
    userInput: require(path.join(__dirname, 'robots', 'user-input.js')),
    text: require(path.join(__dirname, 'robots', 'text.js')),
    image: require(path.join(__dirname, 'robots', 'image.js')),
    state: require(path.join(__dirname, 'robots', 'state.js')),
    video: require(path.join(__dirname, 'robots', 'video.js'))
}

async function start() {

    robots.userInput()
    await robots.text()
    await robots.image()
    await robots.video()

    const content = robots.state.load()
    console.dir(content, { depth: null })
}

start()