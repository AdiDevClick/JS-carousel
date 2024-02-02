import { createElement } from "../functions/dom.js"

export class Carousel2 
{

    #isMobile = false
    #element
    #options
    #root
    #container
    #items
    #currentItem = 0
    #nextButton
    #prevButton
    #dots
    #move
    #index
    #onMoveCallbacks = []
    #loadingBar

    constructor(element, options = {}) {
        this.#element = element
        this.#options = Object.assign({}, {
            slidesToScroll: 1,
            visibleSlides: 1,
            pagination: true,
            navigation: true,
            loop: false
        }, options)
        let children = [].slice.call(this.#element.children)
        this.#root = createElement('div', {class: 'carousel'})
        this.#root.setAttribute('tabindex', 0)
        this.#container = createElement('div', {class: 'carousel__container'})
        this.#root.append(this.#container)
        this.#items = children.map(child => {
            let item = createElement('div', {class: 'carousel__item'})
            item.append(child)
            this.#container.append(item)
            return item
        })
        this.#element.append(this.#root)
        this.#setStyle()
        if (this.#options.navigation) {
            this.#createNavigation()
        }
        if (this.#options.pagination) {
            this.#createPagination()
        }
        
        this.#onMoveCallbacks.forEach(cb => cb(0))

        this.#onWindowResize()
        window.addEventListener('resize', this.#onWindowResize.bind(this))
        this.#root.addEventListener('keyup', e => this.#accessibilityKeys(e))
    }

    #setStyle() {
        let ratio = this.#items.length / this.#visibleSlides
        this.#container.style.width =  (ratio * 100) +'%'
        this.#items.forEach(item => {
            item.style.width = (100 / this.#visibleSlides) / ratio +'%'
        })
    }

    #createNavigation() {
        this.#nextButton = createElement('button', {class: 'carousel__next', type: 'button'})
        this.#prevButton = createElement('button', {class: 'carousel__prev', type: 'button'})
        
        this.#root.append(this.#nextButton)
        this.#root.append(this.#prevButton)

        this.#nextButton.addEventListener('click', this.#next.bind(this))
        this.#prevButton.addEventListener('click', this.#prev.bind(this))

        if (this.#options.loop) return
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

    #createPagination() {
        let paginationContainer = createElement('div', {class: 'carousel__pagination'})
        let buttons = []
        this.#loadingBar = createElement('div', {class: 'carousel__pagination__loadingBar'})
        for (let i = 0; i <this.#items.length; i = i + this.#visibleSlides) {
            let paginationButton = createElement('div', {class: 'carousel__pagination__button'})
            
            buttons.push(paginationButton)
            
            paginationContainer.append(paginationButton)
            paginationButton.addEventListener('click', () => this.#goToItem(i))
        }
        this.#root.append(paginationContainer)

        this.#onMove(index => {
            let activeButton = buttons[Math.floor(index / this.#slidesToScroll)]
            
            if (activeButton) {
                buttons.forEach(button => {
                    button.classList.remove('carousel__pagination__button--active')
                })
                activeButton.classList.add('carousel__pagination__button--active')
                activeButton.append(this.#loadingBar)
            }
        })
    }

    #next() {
        this.#move = 'next'
        this.#goToItem(this.#currentItem + this.#slidesToScroll)
    }

    #prev() {
        this.#move = 'prev'
        this.#goToItem(this.#currentItem - this.#slidesToScroll)
    }

    #goToItem(index) {
        console.log(this.#currentItem + ` currentItem avant index`)
        if (this.#move === 'prev' && this.#currentItem === index) {
            console.log(`c'est égal`)
            // index = this.#currentItem - this.#visibleSlides
            index = 0
            // this.#move = null
        }
        if (this.#move === 'prev') {
            if ((this.#items[this.#currentItem - this.#visibleSlides] === undefined) && this.#currentItem) {
                // index = 0
                index = this.#currentItem

                console.log(`items > index et remise à 0`)
            }
        }

        // if (this.#move === 'next') {
        //     if ((this.#items[this.#currentItem + this.#visibleSlides] > this.#items.length) && index > this.#currentItem) {
        //         index = this.#items.length - this.#visibleSlides
        //         console.log(`items > index et on repart à gauche`)
        //         // this.#move = null
        //         // debugger
        //     }
        // }

        if (index < 0) {
            if (this.#options.loop) {
                index = this.#items.length - this.#visibleSlides
                console.log(`c'est index < 0`)
            } else {
                return
            }
        } else if (index >= this.#items.length || (this.#items[this.#currentItem + this.#visibleSlides] === undefined) && index > this.#currentItem) {
            if (this.#options.loop) {
                index = 0
                console.log(`apres etre allé a droite on revient à 0`)
            } else {
                return
            }
        }

        
        // if (this.#move === 'next') {
        //     if ((this.#items[this.#currentItem + this.#visibleSlides] === undefined) && this.#currentItem <= index) {
        //         index = this.#items.length - this.#visibleSlides
        //         console.log(`items > index et on repart à gauche`)
        //         this.#move = null
        //     }
        // }
        
        
        
            // if ((index - this.#slidesToScroll) < this.#currentItem && this.#currentItem < index) {
            //     index = this.#currentItem - this.#slidesToScroll
            // }
        // if (this.#move === 'next' && this.#currentItem > index) {
            // if (this.#currentItem >= index) {
            //     console.log(this.#move)
            //     index = this.#currentItem + this.#slidesToScroll
            //     // debugger
            //     this.#move = null
            // }
        // }
        // if (this.#move === 'prev' && index < this.#currentItem) {
        //     if ((index - this.#visibleSlides ) < 0) {
        //         // index = 0
        //         index = this.#currentItem - this.#visibleSlides
        //         this.#move = null
        //         console.log(`c'est à gauche`)
        //     }
        // }
        // if (this.#move === 'next'  && index > this.#currentItem) {
        //     index = this.#currentItem + this.#visibleSlides
        // }
        // } else if (this.#move === 'next') {
        //     index = this.#currentItem + this.#visibleSlides
        //     console.log(`c'est à droite`)
        // }
        // if (this.#move === 'prev') {
        //     if (index - (this.#items[this.#currentItem - this.#visibleSlides]) < 0) {
        //         index = 0
        //     }
        // }
        

        

        // if (this.#move === 'next' && this.#currentItem === index) {
        //     if ((index - this.#visibleSlides) <= this.#currentItem && this.#currentItem <= index) {
        //         // index =  0
        //         index = this.#items.length + this.#visibleSlides
        //         // this.#move = null
        //         // console.log(this.#move)
        //         // debugger
        //         console.log(`next move`)
        //     } 
        //     // if (index === this.#currentItem) {
        //     //     index = this.#items.length - this.#slidesToScroll
        //     //     // this.#move = null
        //     // } 
        //     this.#move = null
        //     // return
        // } 
        // if ((index - this.#slidesToScroll) < this.#currentItem || this.#items[this.#currentItem - this.#visibleSlides] === undefined) {
        //     index =  this.#currentItem - this.#slidesToScroll
        // }
        
        // if ((index - this.#slidesToScroll) < this.#slidesToScroll && this.#currentItem > 0) {
        // // (this.#currentItem < (this.#items.length - this.#slidesToScroll)) {
        //     index =  this.#currentItem - this.#slidesToScroll
        //     // index =  this.#currentItem - 1
        //     // debugger
        // } 
        // if ((index - this.#slidesToScroll) <= this.#currentItem)  {
        //     index =  this.#currentItem - this.#slidesToScroll
        // } 
        // if (index < this.#items[this.#currentItem - this.#visibleSlides]) {
        // // (this.#currentItem < (this.#items.length - this.#slidesToScroll)) {
        //     index = this.#items.length - 1
        //     debugger
        // } 
        

        
    
        
        let translateX = index * (-100 / this.#items.length)
        this.#container.style.transform = 'translate3d('+ translateX +'%, 0, 0)'

        this.#currentItem = index
        console.log(index + ' index ajouté au currentitem')
        

        this.#onMoveCallbacks.forEach(cb => cb(index))
        this.#move = null
    }

    #accessibilityKeys(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            this.#next()
        } 
        if (e.key === 'Left' || e.key === 'ArrowLeft') {
            this.#prev()
        }
    }

    #onWindowResize() {
        let mobile = window.innerWidth < 800
        if (mobile !== this.#isMobile) {
            this.#isMobile = mobile
            this.#setStyle()
            this.#onMoveCallbacks.forEach(cb => cb(this.#currentItem))
        }
    }

    #onMove(callback) {
        this.#onMoveCallbacks.push(callback)
    }

    get #visibleSlides() {
        return this.#isMobile ? 1 : this.#options.visibleSlides
    }

    get #slidesToScroll() {
        return this.#isMobile ? 1 : this.#options.slidesToScroll
    }
}