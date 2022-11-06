const axios = require('axios');
axios.defaults.baseURL = 'http://127.0.0.1:8000/api/'


export function sendIdentify(results){
    return axios.post('/', {
        results: results
      })
}

export function sendRecord(name, results){
    return axios.post('/record', {
        name: name,
        results: results
      })
}