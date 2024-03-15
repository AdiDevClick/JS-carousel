import { debounce } from "../functions/dom.js"
import { Carousel } from "./Carousel.js"
import { YoutubePlayer } from "./YoutubePlayer.js"
// import * as player from "https://www.youtube.com/iframe_api"


/**
 * Permet de rajouter une fonction hoover qui prend en compte des videos
 */
export class CarouselVideoPlugin {

    #hovered = false
    #eventAction
    player
    done = null
    #url = "https://www.youtube.com/iframe_api"
    #globalName

    /**
     * @param {Carousel} carousel 
     */
    constructor(carousel) {
        this.carousel = carousel
        carousel.items.forEach(item => {
                this.#createEventListenerFromMouse(item, 'mousemove' , 'mouseDebounce', false, this.#onHover.bind(this))
                this.#debounceMouse(item, 'mouseDebounce')
                item.addEventListener('mouseleave', e => this.#onPointerOut(e))
            return
        })
    }

    /**
     * Permet de pause l'animation lors d'un mouse hover
     * @param {PointerEvent} e 
     */
    #onHover() {
        if (this.carousel.isAlreadyHovered) {
            this.carousel.endTimeAlreadyHovered
        }
        this.#hovered = true
        this.carousel.setHoverStatus = true
        this.carousel.endTime
        this.carousel.setStatus = 'hovered'
        if (this.carousel.getLoadingBar) this.carousel.getLoadingBar.style.animationPlayState = 'paused'
    }

    /**
     * Relance l'animation quand le pointer est enlevé de l'item
     * @param {PointerEvent} e 
     */
    #onPointerOut(e) {
        if (this.carousel.getStatus === 'canResume') {
            this.carousel.setStatus = 'hoveredCompleted'
            this.#hovered = false
            if (this.carousel.getLoadingBar) {
                this.carousel.currentTime
                this.carousel.getLoadingBar.style.animationPlayState = 'running'
                this.carousel.observe(this.carousel.element)
                this.carousel.thisIsAlreadyHovered = true
                this.carousel.startTimeAlreadyHovered
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
            if (this.carousel.getClickStatus) {
                this.carousel.setClickStatus = false
                this.carousel.setScrollingStatus = false
                this.#hovered  = false
                this.carousel.setCase = 2
            }
            if (funct && (!this.#hovered || !this.carousel.getClickStatus) && this.carousel.getStatus !== 'hovered') funct(args)
            // if (funct && (!this.#hovered || !this.carousel.getClickStatus) && this.carousel.getStatus !== 'hovered') funct(args)

            //default
            // if (funct && this.carousel.getStatus !== 'hovered') funct(args)
            // end default

            this.#eventAction = e.clientX
            this.carousel.setPromiseArray = []

            let newEvent = new CustomEvent(`${customEvent}`, {
                bubbles: true,
                detail: {e, object}
            }, {once: true})
            object.dispatchEvent(newEvent)

            animationDelay ? this.carousel.getAnimationDelay : null
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
            const mouseEvent = e.detail.e
            let X = mouseEvent.clientX
            let Y = mouseEvent.clientY
            let mousePosition = X

            if (mousePosition !== this.#eventAction || !this.carousel.getVideoPlayer.videoStatus ) return mousePosition = X

            this.carousel.setStatus = 'hovered' ? this.carousel.setStatus = 'canResume' : null
            return this.#onPointerOut()
        }, (this.carousel.afterClickDelay)))
    }

    get getHoverStatus() {
        return this.#hovered
    }

    set setHoverStatus(status) {
        return this.#hovered = status
    }

    get getDoneStatus() {
        return this.done
    }

    set setDoneStatus(status) {
        return this.done = status
    }
}