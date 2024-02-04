import { createElement, debounce, wait, waitAndFail } from "../functions/dom.js"

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
    #pending = false
    #currentItem = 0
    #element
    #prevButton
    #nextButton
    #items
    #reverseAnimation = false
    // #items = []
    #inAnimationList = []
    #observer
    #intersect
    #ratio = .6
    #options = {
        root: null,
        rootMargin: '0px',
        threshold: this.#ratio
    }
    // #intersectHandler = (entries) => {
    //     entries.forEach(async entry => {
    //         if (entry.intersectionRatio > this.#ratio) {
    //             // console.log("le status apres intersect quand il n'est pas clicked: "+this.#status)
    //             this.#intersect = true
    //             // this.#scrolling = true
    //             // this.#click = false
    //             await this.#whileFalse()
    //         } else {
    //             // return
    //             this.#observe(this.#element)
    //         }
    //     })
    // }
    #intersectHandler = (entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > this.#ratio && !this.#click) {
                // console.log("le status apres intersect quand il n'est pas clicked: "+this.#status)
                this.#intersect = true
                // this.#reverseAnimation = false
                this.#whileFalse()
                this.#animate()
                return
            } else {
                !this.#reverseAnimation ? this.#bubbleAnimation() : null
                this.#observe(this.#element)
                return
            } 
        })
        return
    }
    #moveCallbacks = []
    #isMobile = false
    #loadingBar
    #offset = 0
    #move
    #resolvedPromisesArray = []

    /**
     * @param {HTMLElement} element 
     * @param {Object} options 
     * @param {Object} [options.slidesToScroll=1] Permet de définir le nombre d'éléments à faire défiler 
     * @param {Object} [options.visibleSlides=1] Permet de définir le nombre d'éléments visibles dans un slide 
     * @param {boolean} [options.loop=false] Permet de définir si l'on souhaite boucler en fin de slide
     * @param {boolean} [options.pagination=false] Permet de définir un nombre de page
     * @param {boolean} [options.navigation=true] Permet de définir la navigation
     * // IMPORTANT !! : si INFINITE = true : l'option loop DOIT ETRE FALSE
     * @param {boolean} [options.infinite=false]
     * @param {boolean} [options.automaticScrolling=true] Permet de définir le scrolling automatique
     * @param {boolean} [options.autoSlideDuration=3000] Permet de définir le délai entre chaque auto scroll - par défaut : 3s
     * @param {boolean} [options.afterClickDelay=10000] Permet de définir un délai après intéraction de l'utilisateur - par défaut : 10s
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
            automaticScrolling: true,
            autoSlideDuration: 3000,
            afterClickDelay: 10000
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
        
        // this.#whileFalse()
        // const doc = document.querySelector('.carousel_container')
        // window.addEventListener('DOMContentLoaded', () => {
        // this.#observer = new IntersectionObserver(this.#intersectHandler, this.#options)
        // if (this.#observer.length > 0) {
        //     this.#observer.unobserve(this.#element)
        // }
        // this.#observer.observe(this.#element)
        // })
        
        // Evènements
        this.#moveCallbacks.forEach(cb => cb(this.#currentItem))
        if (this.options.automaticScrolling && !this.#click) {
            this.#observe(this.#element)
            // this.#whileFalse()
        }
        // if (this.#click) {
        //     this.#whileFalse()
        // }
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
            this.#resolvedPromisesArray = []
            this.#observer.unobserve(elements)
            this.#observer.disconnect()
            this.#reverseAnimation = true
            this.#intersect = false
            // this.#reverseAnimation = true
            // this.#resolvedPromisesArray.push(await wait(100, "je suis devenu hors vue"))
            // this.#animationPause = true
            // console.log(this.#loadingBar.classList)
            
            
        }
        if (this.#status !== 'clicked') {
            this.#observer = new IntersectionObserver(this.#intersectHandler, this.#options)
            this.#observer.observe(elements)
        }
    }

    #animate() {
        console.log('jai demadner le style a defaut')
        if (this.#loadingBar && this.#reverseAnimation && this.#intersect) {
            console.log('je souhaite remettre le style a défaut')
            this.#reverseAnimation = false
            // this.#loadingBar.removeAttribute('style')
            this.#loadingBar.classList.remove('carousel__pagination__loadingBar--fade')
            // this.#loadingBar.classList.add('carousel__pagination__loadingBar')
            // this.#loadingBar.style.display = 'none'
            this.#loadingBar.removeAttribute('style')
            // this.#loadingBar.style.display = 'block'
            // this.#loadingBar.style.animationDuration = '3000ms'
            // this.#loadingBar.style.animationDirection = 'normal'
            // this.#animationPause = true
            // this.#loadingBar.style.animationDelay = '500ms'
            // this.#loadingBar.style.animationDelay = '0'
            // this.#loadingBar.style.display = ''
            // this.#loadingBar.classList.add('carousel__pagination__loadingBar')
            console.log('jai tout modifier')
            return
        }
        console.log('je suis sense lavoir eu')
    }

    async #bubbleAnimation() {
        // this.#observer.observe(this.#paginationButton)
        console.log('quel status pour mon reverse : '+this.#reverseAnimation+' ca intersect : '+this.#intersect+' taille de larray : '+ +' Petit check dans le bubble :'+' status : '+this.#status , 'clicked : '+this.#click, 'pending : ' + this.#pending)
        // console.log(this.#loadingBar.classList.value)
        if (!this.#scrolling && this.#loadingBar && !this.#reverseAnimation && this.#loadingBar.classList.value !== 'carousel__pagination__loadingBar carousel__pagination__loadingBar--fade') {
            try {
                console.log('object2')
                this.#reverseAnimation = true
                this.#status = 'inverseAnimation'
                this.#intersect = false
            // this.#loadingBar.style.display = 'none'
            // this.#loadingBar.removeAttribute('style')
            // this.#loadingBar.classList.remove('carousel__pagination__loadingBar')
            
                
                this.#loadingBar.classList.add('carousel__pagination__loadingBar--fade')
                // console.log('je reverse')
                // this.#loadingBar.style.animationDuration = '3000ms'
                this.#loadingBar.style.animationDirection = 'reverse'
                // this.#loadingBar.style.animationPlayState = 'paused'
                
                
                this.#resolvedPromisesArray.push(await wait(this.#autoSlideDuration, "je souhaite voir l'animation en reverse"))
                const r = await this.getStates
                if (r.status === 'rejected') {
                    throw new Error(`Promesse ${r.reason} non tenable`, {cause: r.reason})
                }
                console.log("j'ai demandé un display none")
                // this.#reverseAnimation = false
                this.#loadingBar.style.display = 'none' 
                this.#status = 'inverseComplete'
                console.log(this.#status)
                return
                
            } catch (error) {
                console.log(error + 'ca devrait etre r')
                this.#loadingBar.style.display = 'none' 
                // this.#reverseAnimation = false
                // this.#loadingBar.classList.remove('carousel__pagination__loadingBar--fade')
                // this.#loadingBar.removeAttribute('style')
                // this.#loadingBar.style.animationDirection = 'normal'
                // this.#loadingBar.style.display = 'block'
                return this.#whileFalse()
            }
            // this.#loadingBar.style.display = 'block'
            // console.log('test apres 1000')
            // this.#loadingBar.classList.remove('carousel__pagination__loadingBar--fade')
            // this.#loadingBar.style.display = 'none'
        }
        return
    }

    #disconnectObserver(message) {
        this.#observer.disconnect
        // this.#element.remove()
        throw new Error(message)
    }
    
    get getStates() {
        return this.#promiseState(this.#resolvedPromisesArray)
    }

    // get prom() {
    //     let r
    //     this.#resolvedPromisesArray.forEach(element => {
    //         r = element
    //     })
    //     return r
    // }

    #promiseState(promise) {
        const pendingState = { status: "pending" };
        
        return Promise.race(promise, pendingState)
            .then(
                (value) =>
                    value === pendingState ? value : { status: "fulfilled", value },
                (reason) => ({ status: "rejected", reason }),
        )
    }

    
    async #whileFalse() {
        debugger
        console.log('je suis dans while')
        if (this.#scrolling || !this.#intersect) {
        // if (this.#scrolling || !this.#intersect) {
        // if (this.#scrolling || !this.#intersect || this.#pending) {
            return
        }
        
        try {
            // this.#reverseAnimation = false
            if (this.#click || this.#status === 'clicked') {
                // this.#resolvedPromisesArray.push(await waitAndFail(this.#autoSlideDuration, "j'ai clic"))
                // this.#status = 'clicked'
                this.#resolvedPromisesArray.push(await waitAndFail(100, "j'ai clic"))
                array = this.#resolvedPromisesArray.length 
            } else {
                this.#resolvedPromisesArray.push(await wait(this.#autoSlideDuration, "J'ai demandé un slide normal"))
            }
            const array = this.#resolvedPromisesArray.length
            // console.log('taille de larray : '+array +' Petit check dans le while :'+' status : '+this.#status , 'clicked : '+this.#click, 'pending : ' + this.#pending)
            // if (this.#pending) return
            const r = await this.getStates
            if (r.status === 'rejected') {
                    throw new Error(`Promesse ${r.reason} non tenable`, {cause: r.reason})
                }
            // if (this.#click || this.#status === 'clicked') {
            //     // console.log('jai ete click')
            //     // console.log("click status : " +this.#click + " status global : " +this.#status + "array length: "+array)
            //     // this.#click = true
            //     // this.#resolvedPromisesArray.push(await waitAndFail(500, "Ca commence à spam..."))
            //     return
            // }
            // array = this.#resolvedPromisesArray.length
            // if (this.#status !== 'clicked') {
            
            if (!this.#click) {
                this.#scrolling = true
                // this.#pending = true
                this.#onFulfilled(array)
            }
            return
        } catch (error) {
            this.#onReject()
        }
    }
    // #whileFalse() {
    //     if (this.#scrolling || !this.#intersect) {
    //         return
    //     }
    //     // const p = wait(this.#autoSlideDuration)
    //     this.#resolvedPromisesArray.push(wait(this.#autoSlideDuration))
    //     this.#scrolling = true
    //     this.#status = 'pending'
    //     // Promise.race(this.#resolvedPromisesArray)
    //     return wait(this.#autoSlideDuration)
    //         .then(() => {
    //             console.log(wait(this.#autoSlideDuration) +" celle qui devrait être à 3000")
    //             return this.#test()
    //         })
    //         .catch((e) => {
    //             console.log(e)
    //             return this.#test()
    //         })
    // }
    
    // #test() {
    //     try {
    //         if (!this.#click && this.#status === 'pending') {
    //             this.#next()
    //             this.#scrolling = false
    //             this.#status = 'completed'
    //             console.log(wait(this.#autoSlideDuration) +" celle qui a été exécutée à 3000")
    //             return this.#whileFalse()
    //         }
    //         if (this.#status === 'completed' || this.#status === 'clickComplete') {
    //             console.log(wait(this.#autoSlideDuration) +" il va return")
    //             return
    //         // this.#whileFalse()
    //         }
    //     } catch (error) {
    //         if (this.#click && this.#status === 'clicked') {
    //             this.#click = false
    //             // waitAndFail(this.#autoSlideDuration)
    //             wait(this.#autoSlideDuration)
    //                 .then (() => {
    //                     this.#scrolling = false
    //                     this.#status = 'clickComplete'
    //                     // this.#next()
    //                 })
    //                 .then(() => {
    //                     console.log(wait(this.#autoSlideDuration) +" celle qui devrait être à 0")
    //                     // this.#next()
    //                     this.#whileFalse()
    //                 })
    //                 .catch((e) => {
    //                     console.log(e)
    //                 })
    //         }
    //     }
    // }
    
    #onFulfilled(arrayLength) {
        // console.log('je suis dans onfill')
        // if (this.#click === false && this.#pending) {
        if (this.#click === false) {
            this.#scrolling = false
            // this.#pending = false
            if (arrayLength <= this.#resolvedPromisesArray.length) this.#next()
            this.#resolvedPromisesArray = []
            this.#status = 'completed'
            if (this.#status === 'completed') return this.#whileFalse()
        }
        return
    }
    #onReject() {
        // console.log('je suis dans onreject')
        if (this.#click) {
            // this.#resolvedPromisesArray = []
            this.#animate()
            this.#intersect = true
            this.#click = false
            this.#scrolling ? this.#scrolling = false : null
            this.#status = 'clickComplete'
            if (this.#status === 'clickComplete') return this.#whileFalse()
        }
        return
    }
    // #test() {
    //     if (this.#click && this.#status === 'clicked') {
    //         this.#click = false
    //         // waitAndFail(this.#autoSlideDuration)
    //         wait(this.#autoSlideDuration)
    //             .then (() => {
    //                 this.#scrolling = false
    //                 this.#status = 'clickComplete'
    //                 // this.#next()
    //             })
    //             .then(() => {
    //                 console.log(wait(this.#autoSlideDuration) +" celle qui devrait être à 0")
    //                 // this.#next()
    //                 this.#whileFalse()
    //             })
    //             .catch((e) => {
    //                 console.log(e)
    //             })
    //     }
    //     if (!this.#click && this.#status === 'pending') {
    //         this.#next()
    //         this.#scrolling = false
    //         this.#status = 'completed'
    //         console.log(wait(this.#autoSlideDuration) +" celle qui a été exécutée à 3000")
    //         this.#whileFalse()
    //     }
    //     if (this.#status === 'completed' || this.#status === 'clickComplete') {
    //         console.log(wait(this.#autoSlideDuration) +" il va return")
    //         return
    //         // this.#whileFalse()
    //     }
    // }
    
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
        
        this.#createEventListenerFromClick(this.#nextButton, 'next', (this.#afterClickDelay + this.#autoSlideDuration), this.#next.bind(this))
        this.#createEventListenerFromClick(this.#prevButton, 'prev', (this.#afterClickDelay + this.#autoSlideDuration), this.#prev.bind(this))
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
            // debugger
            funct(args)
            this.#status = 'clicked'
            this.#resolvedPromisesArray = []
            this.#scrolling = true
            this.#click = true
            this.#reverseAnimation = false
            let newEvent = new CustomEvent(`${event}`, {
                bubbles: false,
                detail: object,
            }, {once: true})
            object.dispatchEvent(newEvent)
            this.#delayAnimation(animationDelay)
        })
    }

    #debounce(object, event) {
        object.addEventListener(event, debounce( () => {
            let array = this.#resolvedPromisesArray.length
            if (this.#status === 'clicked' || this.#click === true) {
                if (array > this.#resolvedPromisesArray.length) {
                    this.#resolvedPromisesArray = []
                    return
                } else {
                    // this.#click = true
                    this.#scrolling = false
                    // this.#resolvedPromisesArray = []
                    this.#whileFalse()
                }
            }
        }, (this.#afterClickDelay)))
    }

    #cancelPromise() {
        const actualPromise = new Promise((resolve, reject) => { setTimeout(resolve, 10000) });
        let cancel;
        const cancelPromise = new Promise((resolve, reject) => {
        cancel = reject.bind(null, { canceled: true })
        })
        const cancelablePromise = Object.assign(Promise.race([actualPromise, cancelPromise]), { cancel });
    }

    // #debounce(object, event) {
    //     object.addEventListener(event, debounce(() => {
    //         if (this.#status === 'clicked') {
    //             this.#click = true
    //             this.#scrolling = false
    //             // this.#resolvedPromisesArray.push(waitAndFail(100))
    //             // waitAndFail(100)
    //             this.#test()
    //         }
    //     }, (this.#afterClickDelay)))
    // }

    #delayAnimation(duration) {
        if (this.#loadingBar) {
            // this.#loadingBar.style.display = 'block'
            // this.#loadingBar.style.animationDirection = 'normal'
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
            this.#paginationButton = createElement('div', {class: 'carousel__pagination__button'})
            this.#createEventListenerFromClick(this.#paginationButton, 'paginationButton', this.#afterClickDelay + this.#autoSlideDuration, this.#goToItem.bind(this), i + this.#offset)
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
            this.#debounce(this.#paginationButton, 'paginationButton')
            pagination.append(this.#paginationButton)
            buttons.push(this.#paginationButton)
        }
        // this.#observe(pagination)
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
                if (!this.#click) this.#delayAnimation(this.#autoSlideDuration)
            }
        })
    }

    #next() {
        this.#goToItem(this.#currentItem + this.#slidesToScroll)
    }

    #prev() {
        this.#goToItem(this.#currentItem - this.#slidesToScroll)
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

    /** @returns {number} */
    get #autoSlideDuration() {
        return this.options.autoSlideDuration
    }

    /** @returns {number} */
    get #afterClickDelay() {
        return this.options.afterClickDelay
    }
}