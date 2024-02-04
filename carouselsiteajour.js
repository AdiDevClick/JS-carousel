import { createElement, debounce, wait, waitAndFail } from "../functions/dom.js"

export class Carousel 
{

    /**
     * This callback type is called `requestCallback` and is displayed as a global symbol.
     * @callback moveCallback
     * @param {number} index
     */

    #scrolling = false
    #status = 'pending'
    #currentItem = 0
    #element
    #prevButton
    #nextButton
    #items
    // #items = []

    #observer
    #intersect
    #ratio = .6
    #options = {
        root: null,
        rootMargin: '0px',
        threshold: this.#ratio
    }
    #intersectHandler = (entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > this.#ratio) {
                this.#intersect = true
                this.#whileFalse()
            } else {
                this.#observe(this.#element)
            }
        })
    }
    #moveCallbacks = []
    #isMobile = false
    #loadingBar
    #offset = 0
    #move

    /**
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @param {Object} [options.slidesToScroll=1] Permet de définir le nombre d'éléments à faire défiler 
     * @param {Object} [options.visibleSlides=1] Permet de définir le nombre d'éléments visibles dans un slide 
     * @param {boolean} [options.loop=false] Permet de définir si l'on souhaite boucler en fin de slide
     * @param {boolean} [options.pagination=false] Permet de définir un nombre de page
     * @param {boolean} [options.navigation=true] Permet de définir la navigation
     * @param {boolean} [options.infinite=false] 
     * @param {boolean} [options.automaticScrolling=true] Permet de définir le scrolling automatique toutes les 3s
     */
    constructor(element, options = {}) {
        this.#element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            visibleSlides: 1,
            loop: false,
            pagination: false,
            navigation: true,
            infinite: false,
            automaticScrolling: true
        }, options)

        if (options.loop && options.infinite) {
            throw new Error(`Vous ne pouvez pas être à la fois en boucle ET en infini`)
        }
        let children = [].slice.call(element.children)

        // Modification du DOM
        this.root = createElement('div', {class: 'carousel'})
        this.container = createElement('div', {class: 'carousel__container'})
        this.root.setAttribute('tabindex', 0)
        this.root.append(this.container)
        this.#element.append(this.root)
        this.#items = children.map(child => {
            const item = createElement('div', {class: 'carousel__item'})
            item.append(child)
            this.container.append(item)
            return item
        })
        // children.forEach(child => {
        //     let item = createElement('div', {class: 'carousel__item'})
        //         item.append(child)
        //         this.container.append(item)
        //         this.#items.push(item)
        // })
        if (this.options.infinite) {
            this.#offset = this.#visibleSlides + this.#slidesToScroll
            if (this.#offset > children.length) {
                console.error(`Vous n'avez pas assez d'éléments dans le carousel`, element);
            }
            this.#items = [
                ...this.#items.slice(this.#items.length - this.#offset).map(item => item.cloneNode(true)),
                ...this.#items,
                ...this.#items.slice(0, this.#offset).map(item => item.cloneNode(true))
            ]
            // this.#currentItem = offset
            this.#goToItem(this.#offset, false)
        }
        this.#items.forEach(item => this.container.append(item))
        this.setStyle()
        if (this.options.navigation) {
            this.#createNavigation()
        }
        if (this.options.pagination) {
            this.#createPagination()
        }
        // const doc = document.querySelector('.carousel_container')
        // window.addEventListener('DOMContentLoaded', () => {
        // this.#observer = new IntersectionObserver(this.#intersectHandler, this.#options)
        // if (this.#observer.length > 0) {
        //     this.#observer.unobserve(this.#element)
        // }
        // this.#observer.observe(this.#element)
        // })
        // this.#whileFalse()
        
        // Evènements
        this.#moveCallbacks.forEach(cb => cb(this.#currentItem))
        if (this.options.automaticScrolling) {
            this.#observe(this.#element)
        }
        
        this.#onWindowResize()
        window.addEventListener('resize', this.#onWindowResize.bind(this))
        this.root.addEventListener('keyup', e => this.#accessibilityKeys(e))
        if (this.options.infinite) {
            this.container.addEventListener('transitionend', this.#resetInfinite.bind(this))
        }
    }

    #accessibilityKeys(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            this.#next()
        } 
        if (e.key === 'Left' || e.key === 'ArrowLeft') {
            this.#prev()
        }
    }

    /**
     * Applique les bonnes dimensions aux éléments du carousel
     */
    setStyle() {
        let ratio = this.#items.length / this.#visibleSlides
        this.container.style.width = (ratio * 100) + "%"
        this.#items.forEach(item => {
            item.style.width = ((100 / this.#visibleSlides) / ratio) + "%"
        })
    }

    /**
     * @param {NodeListOf.<HTMLElement>} elements 
     */
    #observe(elements) {
        if (this.#observer) {
            this.#observer.unobserve(elements)
            this.#observer.disconnect()
            this.#intersect = false
        }
        this.#observer = new IntersectionObserver(this.#intersectHandler, this.#options)
        this.#observer.observe(elements)
    }

    #disconnectObserver(message) {
        this.#observer.disconnect
        // this.#element.remove()
        throw new Error(message)
    }

    #whileFalse() {
        if (this.#scrolling || !this.#intersect) {
            return
        }
        if (this.#status === 'clicked') {
            return
        }
        // } else {
        this.#status = 'pending'
        this.#scrolling = true
            wait(3000)
                .then(() => {
                    if (this.#status === 'pending') {
                        this.#next()
                        this.#status = 'completed'
                    }
                })
                // .then(() => {
                //     if (this.#status === 'clicked') {
                //         waitAndFail(500)
                //     } else {
                //         wait(500)
                //     }
                // })
                .then(() => {
                    if (this.#status === 'completed') {
                        this.#scrolling = false
                        this.#whileFalse()
                    }
                })
                // .catch(console.log)
            // .then(() => {
            //     console.log(this.#status)
            //     this.#whileFalse()
            // nextButton.addEventListener('click', debounce(() => {
            //     if (checkIndex !== this.#currentItem) {
            //         this.whileFalse()
            //         checkIndex = this.#currentItem
            //     }
            // }, 500))
            // })
        
    }

    
    /**
     * Crer les flèches de navigation
     */
    #createNavigation() {
        this.#nextButton = createElement('div', {
            class: 'carousel__next'
        })
        this.#prevButton = createElement('div', {
            class: 'carousel__prev'
        })
        this.root.append(this.#nextButton)
        this.root.append(this.#prevButton)
        // let checkIndex = this.#currentItem
        // this.#prevButton.addEventListener('click', this.#prev.bind(this))
        
        this.#createEventListenerFromClick(this.#nextButton, 'next', 13000, this.#next.bind(this))
        this.#createEventListenerFromClick(this.#prevButton, 'prev', 13000, this.#prev.bind(this))
        this.#debounce(this.#nextButton, 'next')
        this.#debounce(this.#prevButton, 'prev')
        if (this.options.loop === true) return
        this.#onMove(index => {
            if (index === 0) {
                this.#prevButton.classList.add('carousel__prev--hidden')
                this.#prevButton.disabled = true
            } else {
                this.#prevButton.classList.remove('carousel__prev--hidden')
                this.#prevButton.disabled = false
            }

            if (this.#items[this.#currentItem + this.#visibleSlides] === undefined) {
                this.#nextButton.classList.add('carousel__next--hidden')
                this.#nextButton.disabled = true
            } else {
                this.#nextButton.classList.remove('carousel__next--hidden')
                this.#nextButton.disabled = false
            }
        })
    }

    #createEventListenerFromClick(object, event, animationDelay, funct, args) {
        object.addEventListener('click', () => {
            funct(args)
            this.#status = 'clicked'
            let newEvent = new CustomEvent(`${event}`, {
                bubbles: false,
                detail: this.object
            })
            object.dispatchEvent(newEvent)
            this.#delayAnimation(animationDelay)
        })
    }

    #debounce(object, event) {
        object.addEventListener(event, debounce(() => {
            // if (checkIndex !== this.#currentItem) {
            if (this.#status !== 'completed' || this.#status !== 'pending') {
                this.#status = 'completed'
                this.#scrolling = false
                this.#whileFalse()
            }
        }, 10000))
    }

    #delayAnimation(duration) {
        if (this.#loadingBar) {
            this.#loadingBar.style.animationDuration = `${duration}ms`
        }
    }

    /**
     * Crer la pagination dans le DOM
     */
    #createPagination() {
        let pagination = createElement('div', {class: 'carousel__pagination'})
        this.#loadingBar = createElement('div', {class: 'carousel__pagination__loadingBar'})
        let buttons = []
        this.root.append(pagination)
        for (let i = 0; i < this.#items.length - 2 * this.#offset; i = i + this.#slidesToScroll) {
            let button = createElement('div', {class: 'carousel__pagination__button'})
            this.#createEventListenerFromClick(button, 'paginationButton', 13000, this.#goToItem.bind(this), i + this.#offset)
            // button.addEventListener('click', () => {
            //     this.#status = 'clicked'
            //     this.#goToItem(i + this.#offset)
            //     let event = new CustomEvent('paginationButton', {
            //         bubbles: false,
            //         detail: button
            //     })
            //     button.dispatchEvent(event)
            //     this.#delayAnimation(13000)
            // })
            this.#debounce(button, 'paginationButton')
            pagination.append(button)
            buttons.push(button)
        }
        this.#onMove(index => {
            let count = this.#items.length - 2 * this.#offset
            let activeButton = buttons[Math.floor(((index - this.#offset) % count) / this.#slidesToScroll)]
            if (activeButton) {
                buttons.forEach(button => {
                    button.classList.remove('carousel__pagination__button--active')
                    this.#loadingBar.remove()
                })
                activeButton.classList.add('carousel__pagination__button--active')
                activeButton.append(this.#loadingBar)
                this.#delayAnimation(3000)
            }
        })
    }

    #next() {
        // debugger
        this.#goToItem(this.#currentItem + this.#slidesToScroll)
    }

    #prev() {
        this.#move = 'prev'
        // debugger
        console.log(this.#currentItem + ' current item')
        this.#goToItem(this.#currentItem - this.#slidesToScroll)
        console.log(this.#offset + ' offset')
    }

    /**
     * Déplace le carousel vers l'élément ciblé
     * @param {number} index 
     * @param {boolean} [animation = true]
     */
    #goToItem(index, animation = true) {
        if (index < 0) {
            let ratio = Math.floor(this.#items.length / this.#slidesToScroll)
            let modulo = this.#items.length % this.#slidesToScroll
            if (this.options.loop) {
                if (ratio - modulo === this.#slidesToScroll && modulo !== 0) {
                    index = this.#items.length - this.#visibleSlides
                } else if (ratio + modulo === this.#visibleSlides && ratio === this.#slidesToScroll) {
                    index = this.#items.length - this.#visibleSlides
                } else {
                    for (let i = 0; i < this.#items.length; i = i + this.#slidesToScroll) {
                        index = i
                    }
                }
            } else {
                return
            }
        } else if ((index >= this.#items.length) || (this.#items[this.#currentItem + this.#visibleSlides] === undefined) && index > this.#currentItem) {
            if (this.options.loop) {
                index = 0
            } else {
                return
            }
        }
        let translateX = index * (-100 / this.#items.length)
        if (!animation) {
            this.container.style.transition = 'none'
        }
        this.container.style.transform = 'translate3d('+ translateX + '%,  0, 0)'
        // Force Repaint
        this.container.offsetHeight
        // End of Force Repaint
        if (!animation) {
            this.container.style.transition = ''
        }
        this.#currentItem = index
        this.#moveCallbacks.forEach(cb => cb(index))
    }

    /**
     * Déplace le container pour donner l'impression d'un slide infini
     */
    #resetInfinite() {
        if (this.#currentItem <= this.options.slidesToScroll) {
            this.#goToItem(this.#currentItem + (this.#items.length - 2 * this.#offset), false)
        } else if (this.#currentItem >= this.#items.length - this.#offset) {
            this.#goToItem(this.#currentItem - (this.#items.length - 2 * this.#offset), false)
        }
    }

    /** @param {moveCallback} */
    #onMove(callback) {
        this.#moveCallbacks.push(callback)
    }
    
    #onWindowResize() {
        let mobile = window.innerWidth < 800
        if (mobile !== this.#isMobile) {
            this.#isMobile = mobile
            this.setStyle()
            this.#moveCallbacks.forEach(cb => cb(this.#currentItem))
        } 
    }

    /** @returns {number} */
    get #slidesToScroll() {
        return this.#isMobile ? 1 : this.options.slidesToScroll
    }

    /** @returns {number} */
    get #visibleSlides() {
        return this.#isMobile ? 1 : this.options.visibleSlides
    }
}