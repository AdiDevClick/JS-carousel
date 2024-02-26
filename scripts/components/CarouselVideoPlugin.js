import { Carousel } from "./Carousel.js"

/**
 * Permet de rajouter la navigation tactile pour le carousel
 */
export class CarouselTouchPlugin {

    #hovered = false
    #eventAction

    /**
     * @param {Carousel} carousel 
     */
    constructor(carousel) {
        // this.carousel = carousel
        carousel.items.forEach(item => {
            if (this.#click !== true || this.#status !== 'clicked') {
                this.#createEventListenerFromMouse(item, 'mousemove' , 'mouseDebounce', false, this.#onHover.bind(this))
                this.#debounceMouse(item, 'mouseDebounce')
                item.addEventListener('mouseout', e => this.#onPointerOut(e))
            }
            return
        })

        this.carousel = carousel
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
     * Debounce le hover
     * @param {HTMLElement} object 
     * @param {AddEventListenerOptions} event 
     * @fires [debounce] <this.#afterClickDelay>
     */
    #debounceMouse(object, event) {
        object.addEventListener(event, debounce((e) => {
            const video = this.container.querySelector('iframe')
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

            // if (video) {
            //     console.log('jai un iframe')
            //     return
            // } else {
            //     console.log('test')
            //     this.#status === 'hovered' ? this.#status = 'canResume' : null
            //     return this.#onPointerOut()
            // }
            this.#status === 'hovered' ? this.#status = 'canResume' : null
            return this.#onPointerOut()
            // if (video) {
            //     return
            // } else {
            //     return this.#onPointerOut()
            // }
        }, (this.#afterClickDelay)))
    }
}