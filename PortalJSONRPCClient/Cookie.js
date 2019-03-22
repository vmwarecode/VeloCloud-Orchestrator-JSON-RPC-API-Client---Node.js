class Cookie {

    constructor(setCookieString) {
        const parts = setCookieString.split(';');
        const nameValuePair = parts[0].split('=');
        this.name = nameValuePair[0];
        this.value = decodeURIComponent(nameValuePair[1]);

        const rawAttrs = parts.slice(1);
        for ( const rawAttr of rawAttrs ) {
            const attr = rawAttr.trim().toLowerCase();
            if ( attr.startsWith('expires') ){
                this.expires = new Date(rawAttr.split('=')[1]);
            } else if ( attr.startsWith('max-age') ){
                this.maxAge = parseInt(rawAttr.split('=')[1]);
            } else if ( attr.startsWith('domain') ){
                this.domain = rawAttr.split('=')[1];
            } else if ( attr.startsWith('path') ){
                this.path = rawAttr.split('=')[1];
            } else if ( attr === 'secure' ){
                this.secure = true;
            } else if ( attr === 'httponly' ){
                this.httpOnly = true;
            }
        }

    }

    hasValue() {
        return !!this.value;
    }

    isExpired() {
        return this.expires && this.expires > new Date();
    }

    toString() {
        const cookie = [];
        cookie.push(this.name + '=' + encodeURIComponent(this.value));

        if ( this.expires ) {
            cookie.push('Expires=' + new Date(this.expires).toGMTString());
        }

        if ( this.maxAge ) {
            cookie.push('Max-Age=' + this.maxAge);
        }

        if ( this.domain ) {
            cookie.push('Domain=' + this.domain);
        }

        if ( this.path ) {
            cookie.push('Path=' + this.path);
        }

        if ( this.secure === true ) {
            cookie.push('Secure');
        }

        if ( this.httpOnly === true ) {
            cookie.push('HttpOnly');
        }

        return cookie.join('; ');
    }

}

module.exports = Cookie;
