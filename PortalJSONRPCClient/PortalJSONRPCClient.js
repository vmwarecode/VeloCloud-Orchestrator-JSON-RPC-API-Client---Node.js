const axios = require('axios');
const Cookie = require('./Cookie.js');

class PortalJSONRPCClient {

    constructor(hostname, verifySSL = true) {

        if ( !verifySSL )
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        this._hostname = hostname.trim();
        this._seqno = 0;
        this._client = axios.create({
            baseURL: `https://${this._hostname}`,
            timeout: 30*1000,
            headers: {
                'Content-Type': 'application/json'
            },
        });

        // Attach interceptors to manage cookies
        this._cookies = {};
        this._client.interceptors.request.use((req) => {
            this._seqno++;
            if ( req.url === '/portal/' ) {
                req.headers['Cookie'] = Object.keys(this._cookies).map((key) =>
                    this._cookies[key].toString()
                );
            }
            return req;
        });
        this._client.interceptors.response.use((res) => {
            const setCookieVals = res.headers['set-cookie'];
            if ( setCookieVals instanceof Array ) {
                for ( const val of setCookieVals ) {
                    const cookie = new Cookie(val);
                    if ( cookie.isExpired() ) {
                        delete this._cookies[cookie.name];
                    } else {
                        this._cookies[cookie.name] = cookie;
                    }
                }
            }
            return res;
        });
    }

    async authenticate(username, password, isOperator = true) {

        const path = isOperator ? 'operatorLogin' : 'enterpriseLogin';

        await this._client.post(`/login/${path}`, {
            username,
            password
        }, {
            maxRedirects: 0,
            validateStatus: code => code === 302
        });

        const sessionCookie = this._cookies['velocloud.session'];
        if ( !sessionCookie || !sessionCookie.hasValue() ) {
            let err = 'Authentication error';
            const messageCookie = this._cookies['velocloud.message'];
            if ( messageCookie && messageCookie.hasValue() ) {
                err += `: ${decodeURIComponent(messageCookie.value)}`;
            }
            throw new Error(err);
        }
    }

    async callApi(method, params = {}, path = '/portal/') {

        method = this.cleanMethodName(method);
        const body = {
            id: this._seqno,
            jsonrpc: '2.0',
            method,
            params
        };

        const response = await this._client.post(path, body);

        if ( response.hasOwnProperty('error') ) {
            throw new Error(response.error.message);
        }
        const responseData = response.data;
        return responseData.result;
    }

    async readLiveData(params) {

        const body = {
            id: this._seqno,
            jsonrpc: '2.0',
            method: 'liveMode/readLiveData',
            params
        };

        const path = '/livepull/liveData/';
        const response = await this._client.post(path, body);

        const responseData = response.data;
        if ( responseData.hasOwnProperty('error') ) {
            throw new Error(responseData.message);
        }
        return responseData.result;
    }

    cleanMethodName(method) {
        return method.replace(/^\/+|\/+$/g, '');
    }

}

module.exports = PortalJSONRPCClient;
