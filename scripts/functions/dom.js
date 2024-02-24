/**
 * @param {NodeListOf.<HTMLElement>} tagName 
 * @param {object.<HTMLElement>} attributes 
 * @returns {HTMLElement}
 */
export function createElement(tagName, attributes = {}) {
    const element = document.createElement(tagName)
    for (const [attribute, value] of Object.entries(attributes)) {
        if (value !== null) {
            element.setAttribute(attribute, value)
        }
    }
    return element
}

/**
 * @param {Function} funct 
 * @param {Number} duration 
 * @returns {Function}
 */
export const debounce = function(funct, duration) {
    let timer
    return (...args) => {
        let context = this
        return new Promise((resolve) => {
            clearTimeout(timer)
            timer = setTimeout(() => {
                funct.apply(context, args)
                resolve(duration)
            }, duration)
        })
    }
}

/**
 * @param {number} duration 
 * @returns {Promise}
 */
export function wait(duration, message) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(message)
            // resolve(`${duration} ${message}`)
            // resolve(duration)
        }, duration)
    })
}
/**
 * @param {number} duration 
 * @returns {Promise}
 */
export function waitAndFail(duration, message) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(message)
            // reject(`${duration} ${message}`)
            // reject(duration))
        }, duration)
    })
}
// export function waitAndFail(duration) {
//     return new Promise((resolve, reject) => 
//         setTimeout(() => 
//             reject(duration)
//         , duration)
//     )
// }