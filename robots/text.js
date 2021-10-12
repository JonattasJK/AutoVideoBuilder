const path = require('path')

const wiki = require('wikijs').default;
const sentenceBoundaryDetection = require('sbd')

const watsonCredentials = require(path.join(__dirname, '..', 'credentials', 'ibm-credentials.json'))

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2021-08-01',
  authenticator: new IamAuthenticator({
    apikey: watsonCredentials.apikey,
  }),
  serviceUrl: watsonCredentials.url,
});

async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentInroSentences(content)
    await fetchKeywordsOfAllSentences(content)

    async function fetchContentFromWikipedia(content){
        
        let page = wiki({
          apiUrl: 'https://en.wikipedia.org/w/api.php'
        }).page(content.searchTerm)

        await page
          .then(page => page.rawContent())
          .then((rawContent) => {
            content.sourceContentOriginal = rawContent;
          })

        await page
          .then(page => page.url())
          .then((url) => {
            content.url = url
          })
    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatetsInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        content.sourceContentSanitized = withoutDatetsInParentheses

        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }

    }

    function breakContentInroSentences(content) {
        content.sentences = []

        let sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences = sentences.slice(0, content.maximumSentences)
        
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    async function fetchKeywordsOfAllSentences(content) {
        for (const sentence of content.sentences){
            await fetchWatsonAndReturnKeywords(sentence)
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence) {
        await naturalLanguageUnderstanding.analyze({
            text: sentence.text,
            features: {
                keywords: {}
            }
        })
        .then(analysisResults => {
            const keywords = analysisResults.result.keywords.map(keyword => keyword.text)
            keywords.forEach((keyword) => { sentence.keywords.push(keyword) })
        })
        .catch(err => {
            console.log('Error: ', err)
        })
    }

}

module.exports = robot