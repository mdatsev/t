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
    'Blogs'  : ['github.com'],
    'Meetups': ['twitter.com']
}

let keywords = {
    'Blogs'        : ['blog', 'blogs', 'articles', 'write'],
    'Integration'  : ['use openfaas', 'via openfaas', ['openfaas', 'use case']],
    'New features' : ['working', 'improving'],
    'New functions': ['working functions', 'create functions'],
    'New templates': ['working templated', 'create templates', 'imrpoving templates']   
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
    const uris = redirects.map(v => v.request.uri)
    const hosts = uris.map(u => u.host)
    //console.log(hosts)
    return by_domain(hosts)   
    
}

function by_domain(hosts) {
    for(i in hosts){
        for (const [key, value] of Object.entries(known_hosts)) {
            if(value.indexOf(hosts[i]) > - 1){
                return key;
            }
        }
    }
    return null
}

function by_url(uris) {
    for(i in uris){
        for (const [key, value] of Object.entries(keywords)) {
            value.map((v) => {
                if(v.constructor === Array) 
                uris.includes(v)
            })    
        }
    }
    return null 
}

function by_og(_) {
    return null
}

function by_keywords(_) {
    return null
}