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
    #currentTime = 0
    #currentItem = 0
    #element
    #prevButton
    #nextButton
    #items
    #duration
    #endTime
    #startTime = 0
    #reverseAnimation
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
            if (entry.intersectionRatio > this.#ratio) {
                // console.log("le status apres intersect quand il n'est pas clicked: "+this.#status)
                this.#intersect = true
                // this.#reverseAnimation = true
                this.#whileFalse()
                this.#animate()
                return
            } else {
                !this.#reverseAnimation ? this.#bubbleAnimation() : null
                // this.#observe(this.#element)
                this.#intersect = false
                return
            }
            // if (this.#reverseAnimation === null) this.#showLoadingBar()
            
        })
        return
    }
    #moveCallbacks = []
    #isMobile = false
    #loadingBar
    #offset = 0
    #resolvedPromisesArray = []

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
        if (this.options.automaticScrolling) {
            this.#observe(this.#element)
        }
        this.#onWindowResize()
        window.addEventListener('resize', this.#onWindowResize.bind(this))
        this.root.addEventListener('keyup', e => this.#accessibilityKeys(e))
        if (this.options.infinite) {
            this.container.addEventListener('transitionend', this.#resetInfinite.bind(this))
            this.startTime
        }
        this.#items.forEach(item => {
            this.#createEventListenerFromMouse(item, 'mouseover' , 'mouseDebounce', false, this.#onHover.bind(this))
            this.#debounceMouse(item, 'mouseDebounce')
            // item.addEventListener('mouseover', e => this.#onHover(e))
        })
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

    #showLoadingBar() {
        // debugger
        if (this.#loadingBar) {
            console.log('test')
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

    #animate() {
        // debugger
        // console.log('jai demadner le style a defaut')
        // this.#loadingBar.style.display = 'none'
        // this.#loadingBar.style.display = 'block'
        // this.#showLoadingBar()
        
        if (this.#loadingBar && this.#reverseAnimation && this.#intersect || this.#status === 'inverseComplete') {
            this.#reverseAnimation = false
            // this.#showLoadingBar()
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
    }

    async #bubbleAnimation() {
        // debugger
        // console.log('quel status pour mon reverse : '+this.#reverseAnimation+' ca intersect : '+this.#intersect+' taille de larray : '+ +' Petit check dans le bubble :'+' status : '+this.#status , 'clicked : '+this.#click, 'pending : ' + this.#pending)
        if (!this.#reverseAnimation && this.#loadingBar) {
        // if (!this.#reverseAnimation && !this.#scrolling && this.#loadingBar && this.#loadingBar.classList.value !== 'carousel__pagination__loadingBar carousel__pagination__loadingBar--fade') {
            try {
                console.log('object2')
                // this.#click = false
                this.#reverseAnimation = true
                this.#status = 'inverseAnimation'
                // this.#intersect = false
                this.#loadingBar.classList.add('carousel__pagination__loadingBar--fade')
                this.#loadingBar.style.animationDirection = 'reverse'
                // this.#loadingBar.style.animationPlayState = 'paused'
                // if (this.#scrolling) {
                    // this.#resolvedPromisesArray.push(await waitAndFail(100, "je souhaite voir l'animation en reverse"))
                // } else {
                    this.#resolvedPromisesArray.push(await wait(2000, "je souhaite voir l'animation en reverse"))
                // }

                // this.#resolvedPromisesArray.push(await wait(this.#autoSlideDuration, "je souhaite voir l'animation en reverse"))
                const r = await this.getStates
                if (r.status === 'rejected') {
                    throw new Error(`Promesse ${r.reason} non tenable`, {cause: r.reason})
                }
                this.#loadingBar.style.display = 'none' 
                this.#status = 'inverseComplete'
                console.log(this.#status)
                // return this.#showLoadingBar()
                // return this.#animate()
            } catch (error) {
                null
                console.log(error + 'ca devrait etre r')
                // this.#loadingBar.style.display = 'none'
                // return this.#animate()
                // return this.#whileFalse()
            }
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

    async #whileFalse() {
        // debugger
        console.log('je suis dans while')
        if (this.#scrolling || !this.#intersect || this.#status === 'hovered') {
        // if (this.#scrolling || !this.#intersect) {
        // if (this.#scrolling || !this.#intersect || this.#pending) {
            return
        }
        
        try {
            // this.#reverseAnimation = false
             
            console.log(this.#status)
            // this.#status !== 'hoveredCompleted' || this.#status !== 'hovered' && 
            if ((this.#click || this.#status === 'clicked') && this.#status !== 'hovered') {
                // this.#resolvedPromisesArray.push(await waitAndFail(this.#autoSlideDuration, "j'ai clic"))
                // this.#status = 'clicked'
                console.log('jai eu la rejected promesse')
                this.#resolvedPromisesArray.push(await waitAndFail(100, "j'ai clic"))
                array = this.#resolvedPromisesArray.length 
            } else if (this.#status !== 'hoveredCompleted' && !this.#click){
                console.log('jai eu la mauvaise promesse')
                this.#resolvedPromisesArray.push(await wait(this.#autoSlideDuration, "J'ai demandé un slide normal"))
            } else {
                debugger
                this.#resolvedPromisesArray = []
                console.log('jai eu la bonne promesse')
                this.#resolvedPromisesArray.push(await wait(this.#currentTime, "J'ai demandé un slide après un hover"))
                // array = this.#resolvedPromisesArray.length
                // return
            }
            // if (this.#status === 'hoveredCompleted'){ 
                
            // }
            let array = this.#resolvedPromisesArray.length
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
            console.log(this.#status + 'test avant scrolling')
            if (!this.#click || this.#status === 'hoveredCompleted') {
                this.#scrolling = true
                // this.#pending = true
                this.#onFulfilled(array)
            }
            return
        } catch (error) {
            console.log(error)
            this.#onReject()
        }
    }
    
    #onFulfilled(arrayLength) {
        // debugger
        console.log('je suis dans onfill')
        // if (this.#click === false && this.#pending) {
        if (!this.#click && this.#intersect && !this.#reverseAnimation) {
            this.#scrolling ? this.#scrolling = false : null
            // this.#pending = false
            if (arrayLength <= this.#resolvedPromisesArray.length) this.#next()
            this.#resolvedPromisesArray = []
            this.#status = 'completed'
            // this.#observe(this.#element)
            // if (this.#status === 'completed') return this.#whileFalse()
            if (this.#status === 'completed') return this.#observe(this.#element)
        }
        // debugger
        this.#scrolling ? this.#scrolling = false : null
        // return this.#animate()
        return
    }
    #onReject() {
        console.log('je suis dans onreject')
        if (this.#click) {
            // this.#resolvedPromisesArray = []
            // this.#intersect = true
            // this.#animate()
            this.#click = false
            this.#scrolling ? this.#scrolling = false : null
            // this.#observe(this.#element)
            this.#status = 'clickComplete'
            if (this.#status === 'clickComplete') return this.#observe(this.#element)
            // if (this.#status === 'clickComplete') return this.#whileFalse()
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
        // let checkIndex = this.#currentItem
        // this.#prevButton.addEventListener('click', this.#prev.bind(this))
        
        // this.#createEventListenerFromClick(this.#nextButton, 'click', 'next', (this.#afterClickDelay + this.#autoSlideDuration), this.#next.bind(this))
        this.#createEventListenerFromClick(this.#nextButton, 'click', 'next', true, this.#next.bind(this))
        // this.#createEventListenerFromClick(this.#prevButton, 'click', 'prev', (this.#afterClickDelay + this.#autoSlideDuration), this.#prev.bind(this))
        this.#createEventListenerFromClick(this.#prevButton, 'click', 'prev', true, this.#prev.bind(this))
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

    get startTime() {
        // return performance.now()
        return this.#startTime = performance.now()
    }

    get endTime() {
        return this.#endTime = performance.now()
    }

    get currentTime() {
        const time = this.#endTime - this.#startTime
        return this.#currentTime = this.#autoSlideDuration - time
    }

    #onHover() {
        // e.preventDefault()
        console.log('je suis en train de hover')
        this.#resolvedPromisesArray = []
        this.endTime
        delete this.endTime
        // if (this.#status === 'hovered') return
        this.#status = 'hovered'
        if (this.#loadingBar) this.#loadingBar.style.animationPlayState = 'paused'
        this.#click = true
        // e.removeEventListener('mouseover', this.#onHover)
        this.#items.forEach(item => {
            item.addEventListener('mouseout', e => this.#onPointerOut(e), {once: true})
        })
    }

    async #onPointerOut(e) {
        // debugger
        // e.preventDefault()
        this.#status = 'hoveredCompleted'
        console.log(this.#status)
        this.#click = false
        if (this.#loadingBar) this.#loadingBar.style.animationPlayState = 'running'
        // await wait(this.#currentTime)
        // this.#status = null
        // this.#next()
        this.currentTime
        // return this.#observe(this.#element)
    }

    #createEventListenerFromMouse(object, eventToListen , customEvent, animationDelay = false, funct = null, args = null) {
        object.addEventListener(eventToListen, () => {
            // debugger
            if (funct) funct(args)
            
            // this.#status = 'clicked'
            this.#resolvedPromisesArray = []
            this.#click = true
            // this.#reverseAnimation = false
            let newEvent = new CustomEvent(`${customEvent}`, {
                bubbles: false,
                detail: object,
            }, {once: true})
            object.dispatchEvent(newEvent)
            animationDelay ? this.#getAnimationDelay : null
            // this.#DelayAnimation(animationDelay)
        })
    }
    
    #createEventListenerFromClick(object, eventToListen , customEvent, animationDelay = false, funct, args) {
        object.addEventListener(eventToListen, () => {
            // debugger
            funct(args)
            this.#status = 'clicked'
            this.#resolvedPromisesArray = []
            this.#scrolling = true
            this.#click = true
            // this.#reverseAnimation = false
            let newEvent = new CustomEvent(`${customEvent}`, {
                bubbles: false,
                detail: object,
            }, {once: true})
            object.dispatchEvent(newEvent)
            animationDelay ? this.#getAnimationDelay : null
            // this.#DelayAnimation(animationDelay)
        })
    }

    // #debounce(object, event, afterClickDelay) {
    #debounceMouse(object, event) {
        object.addEventListener(event, debounce(() => {
            console.log('petit test de debounce')
            // this.#onHover()
            // debugger
            // this.#items.forEach(item => {
            //     item.addEventListener('mouseout', e => this.#onPointerOut(e), {once: true})
            // })
            // this.#onPointerOut()
            return this.#observe(this.#element)
        }, (1500)))
    }

    /**
     * la debounce défault
     */
    #debounce(object, event) {
        object.addEventListener(event, debounce( () => {
            let array = this.#resolvedPromisesArray.length
            if (this.#status === 'clicked' || this.#click && this.#intersect) {
                if (array > this.#resolvedPromisesArray.length) {
                    this.#resolvedPromisesArray = []
                    return
                } else {
                    // this.#click = true
                    this.#scrolling = false
                    // this.#resolvedPromisesArray = []
                    // this.#whileFalse()
                    return this.#observe(this.#element)
                    // this.#observe(this.#element)
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

    /**
     * @param {number} duration
     */
    // set #animationDelay(duration) {
    //     if (this.#loadingBar) {
    //         this._duration = duration
    //         console.log(this._duration + 'je suis dans le setter')
    //         // this.#duration = duration
    //         this.#loadingBar.style.animationDuration = `${this._duration}ms`
    //         if (this.#intersect) this.#showLoadingBar()
    //     }
    // }
    #delayAnimation(duration) {
        if (this.#loadingBar) {
            // this.#loadingBar.style.display = 'block'
            // this.#loadingBar.style.animationDirection = 'normal'
            this.#loadingBar.style.animationDuration = `${duration}ms`
            if (this.#intersect) this.#showLoadingBar()
        }
    }

    get #getAnimationDelay() {
        if (!this.#click) {
            return this.#delayAnimation(this.#autoSlideDuration)
        } 
        return this.#delayAnimation(this.#afterClickDelay + this.#autoSlideDuration)
    }
    // get #AnimationDelay() {
    //     if (!this.#click) {
    //         return this.#autoSlideDuration
    //     } 
    //     return this.#afterClickDelay + this.#autoSlideDuration
    // }

    /**
     * Crer la pagination dans le DOM
     */
    #createPagination() {
        let pagination = createElement('div', {class: 'carousel__pagination'})
        if (this.options.automaticScrolling) {
            this.#loadingBar = createElement('div', {class: 'carousel__pagination__loadingBar'})
        }
        let buttons = []
        this.root.append(pagination)
        for (let i = 0; i < this.#items.length - 2 * this.#offset; i = i + this.#slidesToScroll) {
            this.#paginationButton = createElement('div', {class: 'carousel__pagination__button'})
            this.#createEventListenerFromClick(this.#paginationButton, 'click', 'paginationButton', true, this.#goToItem.bind(this), i + this.#offset)
            // this.#createEventListenerFromClick(this.#paginationButton, 'click', 'paginationButton', this.#afterClickDelay + this.#autoSlideDuration, this.#goToItem.bind(this), i + this.#offset)
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
            
            pagination.append(this.#paginationButton)
            this.#debounce(this.#paginationButton, 'paginationButton')
            buttons.push(this.#paginationButton)
        }
        // this.#observe(pagination)
        this.#onMove(index => {
            let count = this.#items.length - 2 * this.#offset
            let activeButton = buttons[Math.floor(((index - this.#offset) % count) / this.#slidesToScroll)]
            if (activeButton) {
                buttons.forEach(button => {
                    button.classList.remove('carousel__pagination__button--active')
                    this.#loadingBar ? this.#loadingBar.remove() : null
                })
                activeButton.classList.add('carousel__pagination__button--active')
                this.#loadingBar ? activeButton.append(this.#loadingBar) : null
                this.#getAnimationDelay
                this.startTime
                delete this.startTime
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
            // this.container.removeEventListener('transitionend', this.#resetInfinite)
            return this.#goToItem(this.#currentItem + (this.#items.length - 2 * this.#offset), false)
        } else if (this.#currentItem >= this.#items.length - this.#offset) {
            // this.container.removeEventListener('transitionend', this.#resetInfinite)
            return this.#goToItem(this.#currentItem - (this.#items.length - 2 * this.#offset), false)
        }
        return
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