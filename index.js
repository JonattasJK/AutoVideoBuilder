const path = require('path')

const robots = {
    userInput: require(path.join(__dirname, 'robots', 'user-input.js')),
    text: require(path.join(__dirname, 'robots', 'text.js'))

}

async function start() {

    const content = {}
  
    robots.userInput(content)
    await robots.text(content)

    console.log(content)
}

start()