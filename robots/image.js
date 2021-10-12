const { google } = require('googleapis');
const customSearch = google.customsearch('v1')

const path = require('path')
const state = require(path.join(__dirname, 'state.js'))

const googleSearchCredentials = require(path.join(__dirname, '..', 'credentials', 'google_credentials.json'))

async function robot() {
    const content = state.load()
    
    await fetchImagesOffAllSentences(content)

    state.save(content)

    async function fetchImagesOffAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.image = await fetchGoogleAndReturnImagesLinks(query)
            
            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineID,
            q: query,
            searchType: 'image',
            num: 3
        }) 
        const imageUrl = response.data.items.map(item => item.link)
        console.log(imageUrl)
        return imageUrl
    }

}

module.exports = robot