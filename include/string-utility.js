/**
 * @copyright https://github.com/appku/stashku
 * @see https://github.com/appku/stashku
 */
const StringUtility = {

    /**
     * Escape a string value using the given method so it can be safely parsed.
     * @param {String} input - The string value to escape.
     * @param {StringUtility.EscapeMethod|Number} method - The escape method to use.
     * @returns {String}
     */
    escape: function (input, method) {
        if (method == StringUtility.EscapeMethod.URI) {
            return escape(input);
        } else if (method === StringUtility.EscapeMethod.REGEXP) {
            //eslint-disable-next-line no-useless-escape
            return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        }
        throw new Error('A valid "method" argument is reguired.');
    },

    /**
     * @param {String} input - The input string to convert to a URL-friendly slug.
     * @param {String} [sep="-"] - The seperator string between words. Defaults to a "-".
     * @param {Boolean} [lower=true] - Toggles whether to convert the output slug to lower-case. Defaults to true.
     * @param {Boolean} [camel=false] - Converts camel or VB -case inputs to a friendly slug. Defaults to false.
     * @returns {String}
     */
    slugify: function (input, sep, lower, camel) {
        if (typeof sep === 'undefined') {
            sep = '-';
        } else if (sep === null) {
            sep = '';
        }
        let escSep = StringUtility.escape(sep, StringUtility.EscapeMethod.REGEXP);
        //normalize diacritics and remove un-processable characters.
        input = input
            .normalize('NFKD')
            .replace(/[^\w\s.\-_\\/,:;<>|`~!@#$%^&*()[\]]/g, '');
        //handle camel-case inputs
        if (camel) {
            input = input.split('').reduce((pv, cv, index, arr) => {
                if (cv.match(/[A-Z]/) && pv.match(/[^A-Z]$/)) {
                    return pv + sep + cv;
                } else if (cv.match(/[A-Z]/) && pv.match(/[A-Z]/) && arr.length > index + 1 && arr[index + 1].match(/[a-z-]/)) {
                    //current is upper, last was upper, but next is lower (possible tail of uppercase chain)
                    return pv + sep + cv;
                }
                return pv + cv;
            }, '');
        }
        input = input
            .replace(/[\s.\-_\\/,:;<>|`~!@#$%^&*()[\]]+/g, sep) //replace allowed punctuation
            .replace(new RegExp(`^${escSep}*|${escSep}*$`, 'g'), '') //trim ends
            .replace(new RegExp(escSep + '+', 'g'), sep); //collapse dashes
        //make the output lowercase if specified.
        if (typeof lower === 'undefined' || lower) {
            input = input.toLowerCase();
        }
        return input;
    }

};

/**
 * @enum {Number}
 * @readonly
 */
StringUtility.EscapeMethod = {
    URI: 0,
    REGEXP: 1
};

/** @exports StringUtility */
export default StringUtility;