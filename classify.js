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

let known_hosts = {
    'Blogs'  : ['medium.com'],
    'Meetups': ['meetup.com']
}

let keywords = {
    'Blogs'        : ['blog', 'article', 'wrote'],
    'Integration'  : [['use', 'openfaas'], ['using', 'openfaas'], 'via openfaas', ['openfaas', 'use case']],
    'New features' : ['work', 'improv', 'feature'],
    'New functions': [['work', 'functions'], ['creat','functions']],
    'New templates': [['work', 'template'], ['creat','templates'], ['improv', 'templates']]
}

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
    const uris = redirects.filter(e => e).map(v => v.request.uri)
    const hosts = uris.map(u => u.host)
    const hrefs = uris.map(u => u.href)
    return [by_domain(hosts), by_keywords([tweet.text, ...hrefs])].reduce((a, e) => ([...Object.keys(a), ...Object.keys(e)].reduce((a, e) => ({...a, [e]: a[e] + 1 || 1}), {})), {})
    
}

function by_domain(hosts) {
    const confidence = {}
    for(const host of hosts){
        for (const [key, value] of Object.entries(known_hosts)) {
            if(value.indexOf(host) > - 1){
                confidence[key] = confidence[key] + 1 || 1
            }
        }
    }
    return confidence
}

function by_keywords(texts) {
    const confidence = {}
    for(const text of texts){
        const text_lower = text.toLowerCase()
        for (const [key, value] of Object.entries(keywords)) {
            if(value.some(kws => Array.isArray(kws) ? kws.every(kw => text_lower.includes(kw)) : text_lower.includes(kws))) {
                confidence[key] = confidence[key] + 1 || 1
            }
        }
    }
    return confidence
}

function by_og(_) {
    return null
}