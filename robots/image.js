const { google } = require('googleapis');
const customSearch = google.customsearch('v1')
const imageDownloader = require('image-downloader');
const { resolve } = require('path');

const path = require('path');
//const { sentences } = require('sbd');
const state = require(path.join(__dirname, 'state.js'))

const googleSearchCredentials = require(path.join(__dirname, '..', 'credentials', 'google_credentials.json'))

async function robot() {
    const content = state.load()
    
    await fetchImagesOffAllSentences(content)
    await downloadAllImages(content)
    await convertAllImages(content)

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
        return imageUrl
    }

    async function downloadAllImages(content) {
        console.log('Downloading images')
        content.downloadedImages = []

        for (let index = 0; index < content.sentences.length; index++){
            const images = content.sentences[index].image
            console.log(`Image for sentence ${index}`)
            
            for (let imgIndex = 0; imgIndex < images.length; imgIndex++){
                const imageUrl = images[imgIndex]
                try {
                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error ('This image has already been downloaded')
                    }

                    await downloadAndSave(imageUrl, `${index}-original.png`)
                    content.downloadedImages.push(imageUrl)
                    console.log(`> successful download of image ${imageUrl}`)
                    break
                } catch (error) {
                    console.log(`> error downloading ${imageUrl} \n>>> ${error}`)
                }
            }
        }
    }

    async function downloadAndSave(url, fileName){
        return imageDownloader.image({
            url, url,
            dest: path.join(__dirname, '..', 'content', fileName)
        })
    }
}

module.exports = robot