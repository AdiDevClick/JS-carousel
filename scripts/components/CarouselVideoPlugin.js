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
    // #player = window.player
    player
    done = null
    #url = "https://www.youtube.com/iframe_api"
    #globalName

    /**
     * @param {Carousel} carousel 
     */
    constructor(carousel) {
        this.carousel = carousel
        // this.#player = window
        // console.log("status du clic en debut de plugin : ",carousel.getClickStatus) 
        carousel.items.forEach(item => {
            // console.log(this.player)
            // this.player = item.querySelector('.player')
            // if (this.player) this.videoPlayer = new YoutubePlayer(item)

            if (carousel.getClickStatus !== true || carousel.getStatus !== 'clicked') {

                this.#createEventListenerFromMouse(item, 'mouseover' , 'mouseDebounce', false, this.#onHover.bind(this))
                // this.#createEventListenerFromMouse(item, 'touchstart' , 'mouseDebounce', false, this.#onHover.bind(this))
                this.#debounceMouse(item, 'mouseDebounce')
                item.addEventListener('mouseout', e => this.#onPointerOut(e))
                // this.item = item
            }
            
        })

        // this.player = new YoutubePlayer(carousel.container)
        // console.log(this.carousel.getVideoPlayer)
        // console.log(this.player)
        // this.#loadScript(this.#url, window.YT)
        //     .then(() => console.log('YT API Loaded. Youtube embedded is now ready.'))
        // console.log(this.#globalName)
        // this.#iFrameCreation()
        // if (window.YT) {
        //     this.onYouTubeIframeAPIReady()
        // }
        // this.onYouTubeIframeAPIReady()
        // this.carousel = carousel
        
    }

    // #loadScript(scriptUrl, globalName) {
    //     if (globalName && window[globalName]) return Promise.resolve()

    //     return new Promise((resolve, reject) => {
    //         // const iframe = document.getElementById('videoIFrame')
            
    //         if (!window.YT) { 
    //             let scr = document.createElement('script')
    //             scr.type = "text/javascript"
    //             scr.setAttribute('id', 'videoIFrame')
    //             // scr.setAttribute('async', '')
    //             scr.src = scriptUrl
    //             // document.getElementsByTagName('head')[0].appendChild(scr)
    //             const firstScriptTag = document.getElementsByTagName('script')[0]
    //             firstScriptTag.parentNode.insertBefore(scr, firstScriptTag)
            
    //             scr.onload = (() => {
    //                 !globalName || window[globalName] ?
    //                 resolve() :
    //                 reject(Error('window.' + globalName + ' undefined'))
    //             })

    //             scr.onerror = () => reject(Error('Error loading ' + globalName||scriptUrl))
    //             // this.#globalName = YT
    //             // console.log(window.YT)
    //         }
    //     })
    // }

    /**
     * Permet de pause l'animation lors d'un mouse hover
     * @param {PointerEvent} e 
     */
    #onHover() {
        console.log('je hover, done status : ' + this.done + 'hover status : '+ this.#hovered + ' carousel status : '+this.carousel.getStatus)
        if (this.carousel.getClickStatus) return
        // this.carousel.getClickStatus ? this.carousel.setHoverStatus = false : this.carousel.setHoverStatus = true
        this.carousel.endTime
        this.carousel.setPromiseArray = []

        this.carousel.getStatus === 'canResume' ? null : this.carousel.setStatus = 'hovered'
        // this.carousel.getStatus === 'canResume' ? null : this.#hovered = true

        if (this.carousel.getLoadingBar) this.carousel.getLoadingBar.style.animationPlayState = 'paused'
    }

    /**
     * Relance l'animation quand le pointer est enlevé de l'item
     * @param {PointerEvent} e 
     */
    #onPointerOut(e) {
        if (this.carousel.getClickStatus) return
        
        if (this.carousel.getStatus === 'canResume') {
            this.carousel.setStatus = 'hoveredCompleted'
            this.carousel.setHoverStatus = false
            this.#hovered = false
            console.log('jai demander de pause la video')
            !this.#hovered ? this.carousel.getVideoPlayer.getPauseVideo : null
            // !this.#hovered ? this.carousel.getVideoPlayer.getPauseVideo : null
            // this.#hovered ? this.player.onPlayerStateChange(this.player) : null
            // !this.#hovered && this.carousel.getVideoPlayer ? this.carousel.getVideoPlayer.getPauseVideo : null
            // this.#hovered ? this.player.onPlayerStateChange(this.player) : null
            this.carousel.setPromiseArray = []
            if (this.carousel.getStatus === 'hoveredCompleted') {
                if (this.carousel.getLoadingBar) {
                    this.carousel.currentTime
                    this.carousel.getLoadingBar.style.animationPlayState = 'running'
                    // console.log(this.carousel.getLoadingBar.style.animationPlayState)
                    this.carousel.observe(this.carousel.element)
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
            if (funct && (this.carousel.getStatus !== 'hovered' && this.carousel.getStatus !== 'clicked')) funct(args)
            
            // this.#hovered ? this.player.getOnPlayerReady() : null
            // this.#hovered ? this.player.onPlayerReady(this.player.events.events.target) : null
            // console.log(this.player)
            // this.player && this.#hovered ? this.player.getOnPlayerReady : null
            // this.carousel.getVideoPlayer && this.#hovered ? this.carousel.getVideoPlayer.getOnPlayerReady: null
            // this.#hovered ? this.player.events.events.target.playVideo() : null

            this.#eventAction = e.clientX
            this.carousel.setPromiseArray = []
            // console.log('click status dans le debounce : ', this.carousel.getClickStatus)
            this.carousel.getClickStatus ? this.carousel.setHoverStatus = false : this.carousel.setHoverStatus = true
            
            this.carousel.getClickStatus ? this.setHoverStatus = false : this.setHoverStatus = true
            console.log('item hover status : ' + object.getHoverStatus + ' hover status : ' + this.getHoverStatus, 'carousel hover status : ' + this.carousel.getHoverStatus)
            // this.carousel.getClickStatus ? this.this.#hovered = false : this.#hovered = true
            // this.carousel.getClickStatus ? this.this.#hovered = false : this.#hovered = true
            // console.log('hover status dans le debounce : ', this.carousel.getHoverStatus)
            let newEvent = new CustomEvent(`${customEvent}`, {
                bubbles: true,
                detail: {e, object}
            }, {once: true})
            // console.log(object)
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
            
            if (this.carousel.getClickStatus || this.carousel.getStatus === 'clickComplete')  {
                if (this.carousel.getLoadingBar) this.carousel.getLoadingBar.style.animationPlayState = 'running'
                // console.log('je suis ici')
                this.carousel.setScrollingStatus = false
                return
            }
            const mouseEvent = e.detail.e
            let X = mouseEvent.clientX
            let Y = mouseEvent.clientY
            let mousePosition = X

            if (mousePosition !== this.#eventAction && this.carousel.getVideoPlayer.getVideoStatus) {
                console.log('video not done')
                console.log('done status :' + this.done)
                return mousePosition = X
            }

            // if (video) {
            //     console.log('jai un iframe')
            //     return
            // } else {
            //     console.log('test')
            //     this.carousel.status === 'hovered' ? this.carousel.status = 'canResume' : null
            //     return this.#onPointerOut()
            // }
            this.carousel.getStatus === 'hovered' ? this.carousel.setStatus = 'canResume' : null
            return this.#onPointerOut()
            // if (video) {
            //     return
            // } else {
            //     return this.#onPointerOut()
            // }
        }, (this.carousel.afterClickDelay)))
    }

    // #videoPlayback() {
    //     const video = this.carousel.container.querySelector('iframe')
    //     (video.paused) ? video.play() : video.pause()
    // }

    // #iFrameCreation() {
    //     if (!window.YT) {
    //         const tag = document.createElement('script')

    //         tag.src = "https://www.youtube.com/iframe_api"
    //         const firstScriptTag = document.getElementsByTagName('script')[0]
    //         firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    //     }
        
    // }

    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    // onYouTubeIframeAPIReady() {
    //     // if (window.YT) {
    //         this.#player = new window.YT.Player('player', {
    //             videoId: 'UzRY3BsWFYg',
    //             playerVars: { 'autoplay': 1, 'controls': 0 },
    //             events: {
    //                 'onReady': this.#onPlayerReady,
    //                 // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
    //                 'onStateChange': this.#onPlayerStateChange,
    //                 // 'onError': onPlayerError
    //             }
    //         })
            
    //     // }
    //     console.log(this.#player)
    // }

    // 4. The API will call this function when the video player is ready.
    // #onPlayerReady(event) {
    //     event.target.playVideo()
    // }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    // #onPlayerStateChange(event) {
    //     if (event.data === YT.PlayerState.PLAYING && !this.done) {
    //         setTimeout(this.#stopVideo, 6000)
    //         this.done = true
    //     }
    // }

    // #stopVideo() {
    //     this.#player.stopVideo()
    // }

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