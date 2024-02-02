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
    #currentItem = 0
    #element
    #prevButton
    #nextButton
    #items
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
                // this.#scrolling = true
                // this.#click = false
                this.#whileFalse()
            } else {
                // return
                this.#observe(this.#element)
            }
        })
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
            this.#observer.unobserve(elements)
            this.#observer.disconnect()
            this.#intersect = false
        }
        if (this.#status !== 'clicked') {
            this.#observer = new IntersectionObserver(this.#intersectHandler, this.#options)
            this.#observer.observe(elements)
        }
    }

    #disconnectObserver(message) {
        this.#observer.disconnect
        // this.#element.remove()
        throw new Error(message)
    }
    
    async getStates(promises) {
        let r
        promises.forEach(element => {
            r =   element
        })
        let p = this.#promiseState(await r)
        // promises.forEach(async (promise) =>  {
        //     r = this.#promiseState(await promise)
        //     // if (promise.result)
        //     // .then(  
        //     //     (reason) =>
        //     //         console.log(reason + 'test')
        //     // )
        // })
        // console.log(await this.#promiseState(this.p1));
        // console.log(await this.#promiseState(this.p3));
        // console.log(await this.#promiseState(this.p4));
        // this.#resolvedPromisesArray.forEach(async promise => {
        //     await this.#promiseState(promise)
        // })
        // await this.#promiseState(promise)
        return await p
    }

    #promise(promise) {
        // new Promise((res, rej) => setTimeout(() => rej(300), 100));
    }

    #whileFalse() {

        // this.p1 = new Promise((res) => setTimeout(() => res(100), 100));
        this.p1 = new Promise((res) => setTimeout(() => res(this.#autoSlideDuration), this.#autoSlideDuration));
        this.#resolvedPromisesArray.push(this.p1)
        this.p2 = wait(200);
        this.#resolvedPromisesArray.push(this.p2)
        // this.p2 = new Promise((res) => setTimeout(() => res(200), 200));
        this.p4 = waitAndFail(100)
        this.#resolvedPromisesArray.push(this.p4)
        // this.p3 = new Promise((res, rej) => setTimeout(() => rej(300), 100));
        this.p3 = new Promise((res, rej) => setTimeout(() => rej(2000), 2000));
        this.#resolvedPromisesArray.push(this.p3)
        
            console.log(this.#resolvedPromisesArray)
        //     console.log("Immediately after initiation:");
        
        // this.getStates(this.#resolvedPromisesArray)
        // .then(() => {
        //     setTimeout(() => {
        //     console.log("After waiting for 100ms:");
        //     this.getStates(this.#resolvedPromisesArray)
        // }, 100);
        // console.log('object')
        // console.log('test')
        // })
        
        // // this.p3 =   waitAndFail(300)
        // .catch((e) => {
        //     console.log(e + ' test')
        // })
        try {
            console.log("Immediately after initiation:");
            
            const r = this.getStates(this.#resolvedPromisesArray)
            // response.forEach(element => {
            //     console.log(element)
            // })
            // .then ((r) => console.log(r))
            console.log(r)
            setTimeout(() => {
                console.log("After waiting for 100ms:");
                const g = this.getStates(this.#resolvedPromisesArray)
                console.log(g)
            }, 100);
        } catch (error) {
            console.log(error + ' test')
        }


        if (this.#scrolling || !this.#intersect) {
            return
        }
        // const p = wait(this.#autoSlideDuration)
        // this.#resolvedPromisesArray.push(await wait(this.#autoSlideDuration))
        // this.#resolvedPromisesArray.push(await waitAndFail(this.#autoSlideDuration))
        this.#scrolling = true
        this.#status = 'pending'
        // await wait(this.#autoSlideDuration)
        // try {
        //     // const p1 = await waitAndFail(100)
        //     // const p = await this.#promiseState(p1)
        //     await this.#promiseState(this.#resolvedPromisesArray)
            
        //     console.log(this.#resolvedPromisesArray)
        // } catch (e) {
        //     console.log(e + "test")
        // }
        // await this.#promiseState(await waitAndFail(this.#autoSlideDuration))
        console.log('')
            // console.log(this.#resolvedPromisesArray)
        // try {
        //     Promise.race(this.#resolvedPromisesArray)
        //         .then (
        //             (value) =>
        //                 value === 3000 ? this.#test() : this.#whileFalse()
        //         )
        //         // console.log("e")
        //         // this.#test()
        // } catch (e) {
        //     console.log(e + "test")
        // }
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
    #promiseState(promise) {
        const pendingState = { status: "pending" };
        
        return Promise.race([promise, pendingState])
            .then(
                (value) =>
                    value === pendingState ? value : { status: "fulfilled", value },
                (reason) => ({ status: "rejected", reason }),
        )
    }
    async #test() {
        try {
            if (!this.#click && this.#status === 'pending') {
                this.#next()
                this.#scrolling = false
                this.#status = 'completed'
                console.log(wait(this.#autoSlideDuration) +" celle qui a été exécutée à 3000")
                return this.#whileFalse()
            }
            if (this.#status === 'completed' || this.#status === 'clickComplete') {
                console.log(wait(this.#autoSlideDuration) +" il va return")
                return
            // this.#whileFalse()
            }
        } catch (error) {
            if (this.#click && this.#status === 'clicked') {
                this.#click = false
                // waitAndFail(this.#autoSlideDuration)
                wait(this.#autoSlideDuration)
                    .then (() => {
                        this.#scrolling = false
                        this.#status = 'clickComplete'
                        // this.#next()
                    })
                    .then(() => {
                        console.log(wait(this.#autoSlideDuration) +" celle qui devrait être à 0")
                        // this.#next()
                        this.#whileFalse()
                    })
                    .catch((e) => {
                        console.log(e)
                    })
            }
        }
    }
    // async #test() {
    //     // this.#scrolling = true
    //     // console.log(this.#resolvedPromisesArray)
    //     // this.#status = 'pending'
    //     // this.#resolvedPromisesArray.push(await wait(this.#autoSlideDuration))
    //     if (this.#click && this.#status === 'clicked') {
    //         this.#click = false
    //         // waitAndFail(this.#autoSlideDuration)
    //         const p1 = await waitAndFail(200)
    //         const p = await this.#promiseState(p1)
    //         // console.log(p)

    //         // await wait(1000)
    //         console.log(await wait(1000))
    //         // try {
    //         //     const p1 = waitAndFail(100)
    //         //     const p = await this.#promiseState(p1)
    //         //     console.log(p)
    //         //     this.#scrolling = false
    //         //     this.#status = 'clickComplete'
    //         //     // this.#next()
    //         //     this.#whileFalse()
                    
    //         //         // if (value) {
    //         //         //     value === 3000 ? this.#next() : this.#whileFalse()
    //         //         // }
                            
                    
    //         //         // .then (
    //         //         //     (value) =>
    //         //         //         value === 3000 ? this.#next() : this.#whileFalse()
    //         //         // )
    //         //         // this.#whileFalse()
    //         //         // console.log("e")
    //         //         // this.#test()
    //         // } catch (reason) {
    //         //     console.error("failed with reason:", reason);
    //         // }
    //     }
    //     if (!this.#click && this.#status === 'pending') {
    //         this.#next()
    //         this.#scrolling = false
    //         this.#status = 'completed'
    //         // console.log(wait(this.#autoSlideDuration) +" celle qui a été exécutée à 3000")
    //         this.#whileFalse()
    //     }
    //     if (this.#status === 'completed' || this.#status === 'clickComplete') {
    //         return
    //     }
    // }
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
            funct(args)
            this.#status = 'clicked'
            let newEvent = new CustomEvent(`${event}`, {
                bubbles: false,
                detail: object
            }, {once: true})
            object.dispatchEvent(newEvent)
            this.#delayAnimation(animationDelay)
        })
    }

    #debounce(object, event) {
        object.addEventListener(event, debounce(async() => {
            if (this.#status === 'clicked') {
                this.#click = true
                this.#scrolling = false
                this.#resolvedPromisesArray.push(await waitAndFail(100))
                return this.#test()
                
                // try {
                //     Promise.race(this.#resolvedPromisesArray)
                //         .then (
                //             (value) =>
                //                 value === 100 ? this.#test() : this.#whileFalse()
                //         )
                //         console.log(this.#resolvedPromisesArray)
                //         // console.log("e")
                //         // this.#test()
                // } catch (e) {
                //     console.log(e + "test")
                // }
            }
        }, (this.#afterClickDelay)))
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
                this.#delayAnimation(this.#autoSlideDuration)
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

    /** @returns {number} */
    get #autoSlideDuration() {
        return this.options.autoSlideDuration
    }

    /** @returns {number} */
    get #afterClickDelay() {
        return this.options.afterClickDelay
    }
}