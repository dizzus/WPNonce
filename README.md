# WordPress Nonce Token (Paw Extension)
This extension calculates a WordPress nonce ACSRF token based on authorization cookie and some 
additional information, such as nonce salt, action and user id.

## How to use
1. WordPress nonce token is usually passed to the server via **X-WP-Nonce** HTTP header or in the request URL.
2. In order to calculate the nonce value you need to fill in some additional information:
- Nonce action: this value depends on your request. For REST API calls use **wp_rest** value.
- Nonce key: this value is a random string which is found in your wp-config.php file, look for NONCE_KEY string, e.g:
**b8e6e48f8e4e8d58527dd275a0b0c007ac254acd940d7f89605eaa4793b750d0**
- Nonce salt: this value is a random string which is found in your wp-config.php file, look for NONCE_SALT, e.g:
**67cdf48e1eee1abc0a30b4de0bb4efced3ca5bfde8bc8ac4fd02cfc9744b2664**
- Current user id: currently logged user id, e.g: **1**
- WordPress authorization cookie should be set in your request. The cookie may look like:
**wordpress_logged_in_4cbb5e9f028eb09067508507275d2619=admin%7C1565763486%7CsJJHNMTjHk5MZhtVuiWzD1S82aD4K2lTFEV23ckMpdT%7Cfc21632a07e9e9af4136b778f09861d8e1be432b6df709c39f8b2490b4f19ae7**

## License
This Paw Extension is released under the [MIT License](LICENSE).
