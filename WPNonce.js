const md5 = require('md5.js');

const NONCE_KEY = "b8e6e48f8e4e8d58527dd275a0b0c007ac254acd940d7f89605eaa4793b750d0";
const NONCE_SALT ="67cdf48e1eee1abc0a30b4de0bb4efced3ca5bfde8bc8ac4fd02cfc9744b2664";
const NONCE_LIFE = 86400;

function hmac_md5(data, key) {
    return md5(data, key);
}

function unix_time() {
    return 0 | (new Date().getTime() / 1000);
}

var CTX = {
    getKey: function() {
        return NONCE_KEY;
    },
    getSalt: function() {
        return NONCE_SALT;
    },
    getNonceTime: function() {
        return unix_time(); 
    },
    getNonceTick: function() {
        return -1;
    },
    getCookie: function(scheme) { 
        if( scheme != 'logged_in' ) throw 'Invalid cookie scheme: ' + scheme;
        return "admin|1565503864|SszoTUudFzz1qliVOVxL6Q99iEnjarlajyS2YPOK1ZA|02b54eea7c4e2d9434fe5d7a7c64551e6e515bc63d72a7566d6e0faaee2b1750"; 
    },
    getCurrentUser: function() {
        return 1;
    }
};

function wp_nonce_tick() {
    var time = CTX.getNonceTime();
    var halfLife = NONCE_LIFE / 2;
    return Math.ceil(time / halfLife);
}

function wp_salt(scheme) {
    if( scheme != 'nonce' ) throw 'Invalid scheme: ' + scheme;
    return CTX.getKey() + CTX.getSalt();
}

function wp_hash(data, scheme) {
    var salt = wp_salt(scheme);
    return hmac_md5(data, salt);
}

function wp_parse_auth_cookie(cookie, scheme) {
    if( !cookie || !cookie.length ) {
        cookie = CTX.getCookie(scheme);
    }

    var parts = cookie.split('|');
    if( parts.length != 4 ) return null;
    
    var keys = ["username", "expiration", "token", "hmac"];
    var result = {};
    
    for(var i = 0; i < keys.length; ++i) {
        result[keys[i]] = parts[i];
    }
    
    result['scheme'] = scheme;
    return result;
}

function getOrDefault(map, key, def) {
    var value = map[key];
    return value ? value : def;
}

function wp_get_session_token() {
    var cookie = wp_parse_auth_cookie( null, "logged_in" );
    return (cookie != null) ? getOrDefault(cookie, "token", "") : "";
}

function wp_create_nonce(action) {
    var uid = CTX.getCurrentUser();
    var token = wp_get_session_token();
    var tick = CTX.getNonceTick();
    if( tick == -1 ) tick = wp_nonce_tick();

    var hash = wp_hash(tick + '|' + action + '|' + uid + '|' + token, "nonce");
    var pos = hash.length - 12;

    return hash.substring(pos, pos + 10);
}

var WPNonce = function() {
    this.evaluate = function(context) {
        var self = this;
        
        CTX.getCookie = function() {
            var request = context.getCurrentRequest();
            var cookies = (request.getHeaderByName('Cookie') || '').split(';');
            var token = null;
        
            for (var index in cookies) {
                var cookie = cookies[index];
                
                if (cookie.indexOf('wordpress_logged_in_') == 0) {
                    token = cookie.split('=')[1];
                    break;
                }
            }
            
            return (token != null) ? decodeURIComponent(token) : '';
        }
        
        CTX.getKey = function() {
            return self.nonce_key;
        }
        CTX.getSalt = function() {
            return self.nonce_salt;
        }
        CTX.getCurrentUser = function() {
            return self.current_user;
        }
        
        return wp_create_nonce(this.action);
    }
}

WPNonce.identifier = "me.dizzus.WPNonce";
WPNonce.title = "WordPress nonce";
WPNonce.inputs = [
    new InputField(
        'action',
        'Nonce Action',
        'SecureValue',
        {
            persisted: true,
            placeholder: 'Action name, e.g: wp_rest',
            defaultValue: 'wp_rest'
        }
	),

    new InputField(
        'nonce_key',
        'Nonce Key',
        'SecureValue',
        {
            persisted: true,
            placeholder: 'NONCE_KEY from your wp-config.php file',
            defaultValue: NONCE_KEY
        }
	),

    new InputField(
        'nonce_salt',
        'Nonce Salt',
        'SecureValue',
        {
            persisted: true,
            placeholder: 'NONCE_SALT from your wp-config.php file',
            defaultValue: NONCE_SALT
        }
	),

    new InputField(
        'current_user',
        'Current user id',
        'SecureValue',
        {
            persisted: true,
            placeholder: 'User id, e.g: 1',
            defaultValue: '1'
        }
	),
	
];

registerDynamicValueClass(WPNonce);
