const functions = require('firebase-functions')
const express = require('express')
const { ssr } = require('@sveltech/ssr')
const fs = require('fs')

const svelteApp = express()

const script = fs.readFileSync(require.resolve('./dist/bundle.js'), 'utf8')
const template = fs.readFileSync(require.resolve('./dist/__app.html'), 'utf8')

svelteApp.get('*', async (req, res) => {
    const html = await ssr(template, script, req.url, { host: 'http://localhost' })
    res.send(html + '\n<!-- ssr rendered -->')
})

exports.svelteApp = functions.https.onRequest(svelteApp)