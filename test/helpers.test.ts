/**
 * Normalize various items in the unit tests, such as:
 *  - line endings
 *  - path separators
 *  - ascii symbols (checkmark, x, etc...).
 */
export function normalize(text: string) {
    if (!text) {
        return text;
    }
    return text
        //normalize path separators
        .replace(/[\/\\]+/g, '/')
        //normalize line endings
        .replace(/\r?\n/g, '\n')
        //checkmark
        .replace(new RegExp('\u221A', 'g'), '✓')
        //x
        .replace(new RegExp('\u00D7', 'g'), '✖')
        //remove excess leading and trailing whitespace (including newlines)
        .trim();
}