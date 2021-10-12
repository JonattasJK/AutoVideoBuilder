const readline = require('readline-sync')
const path = require('path')

const state = require(path.join(__dirname, 'state.js'))

function robot() {

    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    content.maximumSentences = askAndReturnMaximumSentences()
    
    state.save(content)

    function askAndReturnMaximumSentences(){
        return readline.questionInt('what is the maximum number of sentences in a search? Enter an integer: ')
    }

    function askAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        return prefixes[selectedPrefixIndex]
    }

}

module.exports = robot