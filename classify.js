const {URL} = require('url');
const fs = require('fs')
const util = require('util')
const request = require('request-promise-native')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
; (async () => {
    
    const buffer = await readFile('ifttt_requests')
    const ifttt_requests = buffer.toString().split('\n')
    for(const req of ifttt_requests)
    {
        await print_classify(req)
    }
})()

async function print_classify(req) {
    console.log(req)
    console.log(await classify(req))
}

async function get_link_redirects(text) {
    const url_matches = text.match(/https?:\/\/(t\.co\/\w+)/g) || []
    const get_promises = url_matches.map(url => request(url, { resolveWithFullResponse: true }))
    return Promise.all(get_promises.map(p => p.then(v => v, e => undefined)))
}

async function classify(req) {
    const tweet = JSON.parse(req)
    const redirects = await get_link_redirects(tweet.text)
    const uris = redirects.map(v => v.request.uri)
    const hosts = uris.map(u => u.host)
    console.log(hosts)
    return 'BLOG'
}

function by_domain(_) {
    return null
}

function by_url(_) {
    return null
}

function by_og(_) {
    return null
}

function by_keywords(_) {
    return null
}