import { createElement, debounce, wait, waitAndFail } from "../functions/dom.js"
import { CarouselTouchPlugin } from "./CarouselTouchPlugin.js"

export class Carousel 
{

    /**
     * This callback type is called `requestCallback` and is displayed as a global symbol.
     * @callback moveCallback
     * @param {number} index
     */
    #paginationButton
    #click = false
    #scrolling = false
    #status
    #hovered = false
    #currentTime = 0
    #prevButton
    #nextButton
    #endTime = 0
    #startTime = 0
    #reverseAnimation
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
                this.#animate()
                this.startTime
                return
            } else {
                !this.#reverseAnimation ? this.#bubbleAnimation() : null
                this.#intersect = false
                return
            }
        })
        return
    }
    #moveCallbacks = []
    #isMobile = false
    #loadingBar
    #offset = 0
    #resolvedPromisesArray = []
    #eventAction
    #myIndex
    #reverseMode = false

    /**
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @param {Object} [options.slidesToScroll=1] Permet de définir le nombre d'éléments à faire défiler 
     * @param {Object} [options.visibleSlides=1] Permet de définir le nombre d'éléments visibles dans un slide 
     * @param {boolean} [options.loop=false] Permet de définir si l'on souhaite boucler en fin de slide
     * @param {boolean} [options.pagination=false] Permet de définir une pagination
     * @param {boolean} [options.navigation=true] Permet de définir la navigation
     * // IMPORTANT !! : si INFINITE = true : l'option loop DOIT ETRE FALSE
     * @param {boolean} [options.infinite=false]
     * @param {boolean} [options.automaticScrolling=true] Permet de définir le scrolling automatique - crer aussi un indicateur de temps avant chaques slides
     * @param {boolean} [options.autoSlideDuration=3000] Permet de définir le délai entre chaque auto scroll - par défaut : 3s
     * @param {boolean} [options.afterClickDelay=10000] Permet de définir un délai après intéraction de l'utilisateur - par défaut : 10s
     */
    constructor(element, options = {}) {
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll: 1,
            visibleSlides: 1,
            loop: false,
            pagination: false,
            navigation: true,
            infinite: false,
            automaticScrolling: true,
            autoSlideDuration: 3000,
            afterClickDelay: 10000
        }, options)
        this.currentItem = 0

        if (options.loop && options.infinite) {
            throw new Error(`Vous ne pouvez pas être à la fois en boucle ET en infini`)
        }
        let children = [].slice.call(element.children)

        // Modification du DOM
        this.root = createElement('div', {class: 'carousel'})
        this.container = createElement('div', {class: 'carousel__container'})
        this.root.setAttribute('tabindex', 0)
        this.root.append(this.container)
        this.element.append(this.root)
        this.items = children.map(child => {
            const item = createElement('div', {class: 'carousel__item'})
            item.append(child)
            this.container.append(item)
            return item
        })
        // children.forEach(child => {
        //     let item = createElement('div', {class: 'carousel__item'})
        //         item.append(child)
        //         this.container.append(item)
        //         this.items.push(item)
        // })
        
        if (this.options.infinite) {
            this.#offset = this.#slidesToScroll + this.#visibleSlides
            if (this.#offset > children.length) {
                console.error(`Vous n'avez pas assez d'éléments dans le carousel`, element);
            }
            this.items = [
                ...this.items.slice(this.items.length - this.#offset).map(item => item.cloneNode(true)),
                ...this.items,
                ...this.items.slice(0, this.#offset).map(item => item.cloneNode(true))
            ]
            this.goToItem(this.#offset, false)
        }
        
        this.items.forEach(item => this.container.append(item))
        this.setStyle()
        if (this.options.navigation) {
            this.#createNavigation()
        }
        if (this.options.pagination) {
            this.#createPagination()
        }
        // Evènements
        this.#moveCallbacks.forEach(cb => cb(this.currentItem))
        if (this.options.automaticScrolling) {
            this.#observe(this.element)
        }
        this.#onWindowResize()
        window.addEventListener('resize', this.#onWindowResize.bind(this))
        this.root.addEventListener('keyup', e => this.#accessibilityKeys(e))
        if (this.options.infinite) {
            this.container.addEventListener('transitionend', this.#resetInfinite.bind(this))
        }

        if (this.options.automaticScrolling) {
            this.items.forEach(item => {
                if (this.#click !== true || this.#status !== 'clicked') {
                    this.#createEventListenerFromMouse(item, 'mousemove' , 'mouseDebounce', false, this.#onHover.bind(this))
                    this.#debounceMouse(item, 'mouseDebounce')
                    item.addEventListener('mouseout', e => this.#onPointerOut(e))
                }
                return
            })
        }

        new CarouselTouchPlugin(this)
    }

    disableTransition() {
        this.container.style.transition = 'none'
    }

    enableTransition() {
        this.container.style.transition = ''
    }

    activateClickStatus() {
        this.#status = 'clicked'
        this.#resolvedPromisesArray = []
        this.#scrolling = true
        this.#click = true
    }

    /**
     * Permet l'accessibilité
     * @param {KeyboardEvent} e 
     */
    #accessibilityKeys(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            this.next()
        } 
        if (e.key === 'Left' || e.key === 'ArrowLeft') {
            this.prev()
        }
    }

    /**
     * Applique les bonnes dimensions aux éléments du carousel
     */
    setStyle() {
        let ratio = this.items.length / this.#visibleSlides
        this.container.style.width = (ratio * 100) + "%"
        this.items.forEach(item => {
            item.style.width = ((100 / this.#visibleSlides) / ratio) + "%"
        })
    }

    /**
     * Force l'animation de la loadingBar
     */
    #showLoadingBar() {
        if (this.#loadingBar) {
            if (this.#loadingBar) this.#loadingBar.style.animationPlayState = 'running'
            this.#loadingBar.style.display = 'none'
            this.#loadingBar.style.display = 'block'
        }
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
        if (this.options.automaticScrolling) {
            this.#observer = new IntersectionObserver(this.#intersectHandler, this.#options)
            this.#observer.observe(elements)
        }
        return
    }

    /**
     * Permet de remettre à défaut les options de la loadingBar
     * au cas où elles auraient été reverse après une intersection
     * @returns 
     */
    #animate() {
        if (this.#loadingBar && this.#reverseAnimation && this.#intersect || this.#status === 'inverseComplete') {
            this.#reverseAnimation = false
            this.#loadingBar.classList.remove('carousel__pagination__loadingBar--fade')
            this.#loadingBar.removeAttribute('style')
            return
        }
    }

    /**
     * Reverse l'animation des bulles quand les items n'intersectent pas à l'écran
     * @returns 
     */
    async #bubbleAnimation() {
        if (!this.#reverseAnimation && this.#loadingBar) {
            try {
                this.#reverseAnimation = true
                this.#status = 'inverseAnimation'
                this.#loadingBar.classList.add('carousel__pagination__loadingBar--fade')
                this.#loadingBar.style.animationDirection = 'reverse'
                this.#resolvedPromisesArray.push(await wait(2000, "je souhaite voir l'animation en reverse"))

                const r = await this.getStates
                if (r.status === 'rejected') {
                    throw new Error(`Promesse ${r.reason} non tenable`, {cause: r.reason})
                }
                this.#loadingBar.style.display = 'none' 
                this.#status = 'inverseComplete'
            } catch (error) {
                null
            }
        }
        return
    }

    // #disconnectObserver(message) {
    //     this.#observer.disconnect
    //     // this.element.remove()
    //     throw new Error(message)
    // }
    
    /**
     * Passe un array de promesse définit
     */
    get getStates() {
        return this.#promiseState(this.#resolvedPromisesArray)
    }

    /**
     * Permet de RACE un array de promesse en retournant 
     * le status et la value/reason associée à la promesse qui arrive en première
     * @param {Promise} promise 
     * @returns 
     */
    #promiseState(promise) {
        const pendingState = { status: "pending" };
        
        return Promise.race(promise, pendingState)
            .then(
                (value) =>
                    value === pendingState ? value : { status: "fulfilled", value },
                (reason) => ({ status: "rejected", reason }),
        )
    }

    // get prom() {
    //     let r
    //     this.#resolvedPromisesArray.forEach(element => {
    //         r = element
    //     })
    //     return r
    // }
    
    /**
     * Fonction principale de l'auto-scrolling
     * @returns 
     */
    async #whileFalse() {
        if (this.#scrolling || !this.#intersect || this.#status === 'hovered') return
        
        try {
            if ((this.#click || this.#status === 'clicked')) {
                this.#resolvedPromisesArray.push(await waitAndFail(100, "j'ai clic"))
                array = this.#resolvedPromisesArray.length 
            } else if (this.#status !== 'hoveredCompleted' && !this.#click){
                this.#resolvedPromisesArray.push(await wait(this.#autoSlideDuration, "J'ai demandé un slide normal"))
            } else {
                this.#resolvedPromisesArray = []
                this.#resolvedPromisesArray.push(await wait(this.#currentTime, "J'ai demandé un slide après un hover"))
            }
            let array = this.#resolvedPromisesArray.length
            const r = await this.getStates
            if (r.status === 'rejected') {
                    throw new Error(`Promesse ${r.reason} non tenable`, {cause: r.reason})
                }
            if (!this.#click || this.#status === 'hoveredCompleted' || this.#status === 'canResume') {
                this.#scrolling = true
                this.#onFulfilled(array)
            }
            return
        } catch (error) {
            this.#onReject()
        }
    }
    
    /**
     * Permet de passer au next Slide si les conditions sont réunies
     * @param {[number]} arrayLength 
     * @returns 
     */
    #onFulfilled(arrayLength) {
        if (!this.#click && this.#intersect && !this.#reverseAnimation) {
            this.#scrolling ? this.#scrolling = false : null

            if (arrayLength <= this.#resolvedPromisesArray.length && this.#reverseMode) this.prev()
            if (arrayLength <= this.#resolvedPromisesArray.length && !this.#reverseMode) this.next()

            this.#resolvedPromisesArray = []
            this.#status = 'completed'

            if (this.#status === 'completed') return this.#observe(this.element)
        }
        this.#scrolling ? this.#scrolling = false : null
        return
    }

    /**
     * Permet de blocker le script en cas de clic utilisateur sur les boutons
     * Il reviendra à la fonction 
     * @returns 
     */
    #onReject() {
        if (this.#click) {
            this.#resolvedPromisesArray = []
            this.#click = false
            this.#scrolling ? this.#scrolling = false : null
            this.#status = 'clickComplete'
            if (this.#status === 'clickComplete') return this.#observe(this.element)
        }
        return
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
        this.#createEventListenerFromClick(this.#nextButton, 'click', 'next', true, this.next.bind(this))
        this.#createEventListenerFromClick(this.#prevButton, 'click', 'prev', true, this.prev.bind(this))
        this.debounce(this.#nextButton, 'next')
        this.debounce(this.#prevButton, 'prev')

        if (this.options.loop === true || this.options.infinite === true) return
        this.#onMove(index => {
            if (index === 0) {
                this.#prevButton.classList.add('carousel__prev--hidden')
                this.#prevButton.disabled = true
            } else {
                this.#prevButton.classList.remove('carousel__prev--hidden')
                this.#prevButton.disabled = false
            }

            if (this.items[this.currentItem + this.#visibleSlides] === undefined) {
                this.#nextButton.classList.add('carousel__next--hidden')
                this.#nextButton.disabled = true
                this.#reverseMode = true
            } else {
                this.#nextButton.classList.remove('carousel__next--hidden')
                this.#nextButton.disabled = false
            }
        })
    }

    /**
     * Crer un timer
     */
    get startTime() {
        this.#startTime = 0
        return this.#startTime = performance.now()
    }

    /**
     * Crer un timer
     */
    get endTime() {
        this.#endTime = 0
        return this.#endTime = performance.now()
    }

    /**
     * Permet de vérifier le temps entre le hover et le début du timer
     */
    get currentTime() {
        this.#currentTime = 0
        const time = this.#endTime - this.#startTime
        return this.#currentTime = this.#autoSlideDuration - time
    }

    /**
     * Permet de pause l'animation lors d'un mouse hover
     * @param {PointerEvent} e 
     */
    #onHover() {
        if (this.#click || this.#status === 'hovered') return

        this.endTime
        this.#resolvedPromisesArray = []
        this.#status === 'canResume' ? null : this.#status = 'hovered'

        if (this.#loadingBar) this.#loadingBar.style.animationPlayState = 'paused'
    }

    /**
     * Relance l'animation quand le pointer est enlevé de l'item
     * @param {PointerEvent} e 
     */
    #onPointerOut(e) {
        if (this.#click) return
        
        if (this.#status === 'canResume') {
            this.#status = 'hoveredCompleted'
            this.#hovered = false
            this.#resolvedPromisesArray = []
            if (this.#status === 'hoveredCompleted') {
                if (this.#loadingBar) {
                    this.currentTime
                    this.#loadingBar.style.animationPlayState = 'running'
                    this.#observe(this.element)
                }
            }
        }
        return
    }

    /**
     * Permet de créer un EventListener pour une action Souris contenant un CustomEvent
     * @param {HTMLElement} object 
     * @param {EventListenerOptions} eventToListen 
     * @param {CustomElementConstructor} customEvent  
     * @param {number} animationDelay 
     * @function funct une fonction associée à l'évènement
     * @param {FunctionStringCallback} args Les arguments de la fonction si nécessaire 
     */
    #createEventListenerFromMouse(object, eventToListen , customEvent, animationDelay = false, funct = null, args = null) {
        object.addEventListener(eventToListen, (e) => {
            
            if (funct && (this.#status !== 'hovered' && this.#status !== 'clicked')) funct(args)
            
            this.#eventAction = e.clientX
            this.#resolvedPromisesArray = []
            this.#click ? this.#hovered = false : this.#hovered = true

            let newEvent = new CustomEvent(`${customEvent}`, {
                bubbles: false,
                detail: e
            }, {once: true})
            object.dispatchEvent(newEvent)

            animationDelay ? this.#getAnimationDelay : null
        })
    }
    
    /**
     * Permet de créer un EventListener contenant un CustomEvent
     * @param {HTMLElement} object 
     * @param {EventListenerOptions} eventToListen 
     * @param {CustomElementConstructor} customEvent 
     * @param {number} animationDelay 
     * @function funct une fonction associée à l'évènement
     * @param {FunctionStringCallback} args Les arguments de la fonction si nécessaire
     */
    #createEventListenerFromClick(object, eventToListen , customEvent, animationDelay = false, funct, args) {
        object.addEventListener(eventToListen, (e) => {
            funct(args)
            this.activateClickStatus()
            let newEvent = new CustomEvent(`${customEvent}`, {
                bubbles: false,
                detail: this.e
            }, {once: true})
            object.dispatchEvent(newEvent)
            animationDelay ? this.#getAnimationDelay : null
        })
    }
    /**
     * Debounce le hover
     * @param {HTMLElement} object 
     * @param {AddEventListenerOptions} event 
     * @fires [debounce] <this.#afterClickDelay>
     */
    #debounceMouse(object, event) {
        object.addEventListener(event, debounce((e) => {
            if (this.#click || this.#status === 'clickComplete')  {
                if (this.#loadingBar) this.#loadingBar.style.animationPlayState = 'running'
                this.#scrolling = false
                return
            }
            const mouseEvent = e.detail
            let X = mouseEvent.clientX
            let Y = mouseEvent.clientY
            let mousePosition = X

            if (mousePosition !== this.#eventAction) return mousePosition = X

            this.#status === 'hovered' ? this.#status = 'canResume' : null

            return this.#onPointerOut()
        }, (this.#afterClickDelay)))
    }

    /**
     * Debounce le clic de la pagination ou des boutons droite et gauche
     * @param {HTMLElement} object 
     * @param {AddEventListenerOptions} event 
     * @fires [debounce] <this.#afterClickDelay>
     */
    debounce(object, event) {
        object.addEventListener(event, debounce( () => {
            let array = this.#resolvedPromisesArray.length
            if (this.#status === 'clicked' || this.#click && this.#intersect) {
                if (array > this.#resolvedPromisesArray.length) {
                    this.#resolvedPromisesArray = []
                    return
                } else {
                    this.#scrolling = false
                    return this.#observe(this.element)
                }
            }
        }, (this.#afterClickDelay)))
    }

    // #cancelPromise() {
    //     const actualPromise = new Promise((resolve, reject) => { setTimeout(resolve, 10000) });
    //     let cancel;
    //     const cancelPromise = new Promise((resolve, reject) => {
    //     cancel = reject.bind(null, { canceled: true })
    //     })
    //     const cancelablePromise = Object.assign(Promise.race([actualPromise, cancelPromise]), { cancel });
    // }

    /**
     * Permet de modifier la durée d'animation de la loadingBar
     * @param {number} duration 
     */
    #delayAnimation(duration) {
        if (this.#loadingBar) {
            this.#loadingBar.style.animationDuration = `${duration}ms`
            if (this.#intersect) this.#showLoadingBar()
        }
    }

    /**
     * @returns {@function | delayAnimation}
     */
    get #getAnimationDelay() {
        if (!this.#click) return this.#delayAnimation(this.#autoSlideDuration)
        return this.#delayAnimation(this.#afterClickDelay + this.#autoSlideDuration)
    }

    /**
     * Crer les boutons de pagination
     * @param {number} i 
     */
    #paginate(i) {
        this.#paginationButton = createElement('div', {class: 'carousel__pagination__button'})
            this.#createEventListenerFromClick(this.#paginationButton, 'click', 'paginationButton', true, this.goToItem.bind(this), i + this.#offset)
            this.pagination.append(this.#paginationButton)
            this.buttons.push(this.#paginationButton)
            this.debounce(this.#paginationButton, 'paginationButton')
    }

    /**
     * Crer la pagination dans le DOM
     */
    #createPagination() {
        this.pagination = createElement('div', {class: 'carousel__pagination'})
        if (this.options.automaticScrolling) {
            this.#loadingBar = createElement('div', {class: 'carousel__pagination__loadingBar'})
        }
        this.buttons = []
        this.root.append(this.pagination)
        if (!this.options.infinite) {
            for (let i = 0; i < this.items.length / this.#visibleSlides; i++) {
                this.#paginate(i)
            }
        } else {
            for (let i = 0; i < this.items.length - 2 * this.#offset; i = i + this.#slidesToScroll) {
                this.#paginate(i)
            }
        }
        this.buttons.push(this.#paginationButton)
        let activeButton
        this.#onMove(index => {
            let count = this.items.length - 2 * this.#offset
            
            if (this.options.infinite) {
                activeButton = this.buttons[Math.floor((index % count) / this.#slidesToScroll) ]
            } else {
                activeButton = this.buttons[Math.round(index / this.#slidesToScroll)]
            }

            if (activeButton) {
                this.buttons.forEach(button => {
                    button.classList.remove('carousel__pagination__button--active')
                    this.#loadingBar ? this.#loadingBar.remove() : null
                })
                activeButton.classList.add('carousel__pagination__button--active')
                this.#loadingBar ? activeButton.append(this.#loadingBar) : null
                this.#getAnimationDelay
                this.#intersect ? this.startTime : null
                delete this.startTime
            }
        })
    }

    next() {
        this.goToItem(this.currentItem + this.#slidesToScroll)
    }

    prev() {
        this.goToItem(this.currentItem - this.#slidesToScroll)
    }

    /**
     * Déplace le carousel vers l'élément ciblé
     * @param {number} index 
     * @param {boolean} [animation = true]
     */
    goToItem(index, animation = true) {
        if (index < 0) {
            let ratio = Math.floor(this.items.length / this.#slidesToScroll)
            let modulo = this.items.length % this.#slidesToScroll
            if (this.options.loop) {
                
                if (index + this.#slidesToScroll !== 0) {
                    index = 0
                }
                if (ratio - modulo === this.#slidesToScroll && modulo !== 0) {
                    index = this.items.length - this.#visibleSlides
                    this.#myIndex = 1
                } else if (ratio + modulo === this.#visibleSlides && ratio === this.#slidesToScroll) {
                    index = this.items.length - this.#visibleSlides
                    this.#myIndex = 2
                } else if (ratio - modulo !== this.#slidesToScroll) {
                    if (index + this.#slidesToScroll !== 0) {
                        index = 0
                    } else {
                        index = this.items.length - this.#visibleSlides
                    }
                } else {
                    for (let i = 0; i < this.items.length; i = i + this.#slidesToScroll) {
                        index = i
                    }
                }
            } else {
                return this.#reverseMode = false
            }
        } else if ((index >= this.items.length) || (this.items[this.currentItem + this.#visibleSlides] === undefined) && index > this.currentItem) {
            if (this.options.loop && !this.#reverseMode) {
                index = 0
            } else {
                return
            }
        } else if (index + this.#slidesToScroll > this.items.length) {
            console.log('object')
            index = this.items.length - this.#visibleSlides
        }
        let translateX = index * (-100 / this.items.length)
        if (!animation) {
            this.disableTransition()
        }
        this.translate(translateX)
        // Force Repaint
        this.container.offsetHeight
        // End of Force Repaint
        if (!animation) {
            this.enableTransition()
        }
        this.currentItem = index
        this.#moveCallbacks.forEach(cb => cb(index))
    }

    /**
     * Déplace le container pour donner l'impression d'un slide infini
     */
    #resetInfinite() {
        if (this.currentItem <= this.#slidesToScroll) {
            this.goToItem(this.currentItem + (this.items.length - 2 * this.#offset), false)
            return
        } 
        if (this.currentItem >= this.items.length - this.#offset) {
            this.goToItem(this.currentItem - (this.items.length - 2 * this.#offset), false)
            return
        }
        return
    }

    /** @param {moveCallback} */
    #onMove(callback) {
        this.#moveCallbacks.push(callback)
    }
    
    /**
     * Permet de définir un reStyle en fonction 
     * du changement de la taille de lafenêtre
     */
    #onWindowResize() {
        let mobile = window.innerWidth < 800
        if (mobile !== this.#isMobile) {
            this.#isMobile = mobile
            this.setStyle()
            this.#moveCallbacks.forEach(cb => cb(this.currentItem))
        } 
    }

    translate(percent) {
        this.container.style.transform = 'translate3d('+ percent + '%,  0, 0)'
    }

    /** @returns {number} */
    get #slidesToScroll() {
        return this.#isMobile ? 1 : this.options.slidesToScroll
    }

    /** @returns {number} */
    get #visibleSlides() {
        return this.#isMobile ? 1 : this.options.visibleSlides
    }

    /** @returns {number} */
    get #autoSlideDuration() {
        return this.options.autoSlideDuration
    }

    /** @returns {@param | options.afterClickDelay} */
    get #afterClickDelay() {
        return this.options.afterClickDelay
    }

    /** @returns {number} */
    get containerWidth() {
        return this.container.offsetWidth
    }

    /** @returns {number} */
    get carouselWidth() {
        return this.root.offsetWidth
    }
}