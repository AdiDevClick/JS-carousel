import { debounce } from "../functions/dom.js"
import { Carousel } from "./Carousel.js"
import { CarouselVideoPlugin } from "./CarouselVideoPlugin.js"

export class YoutubePlayer 
{

    videoPlayer = []
    players = []
    player = []
    event = []
    done = true

    /**
     * @param {Carousel} carousel
     */
    constructor(carousel) {
        this.carousel = carousel
        this.videoContainer = carousel.container

        const containers = this.videoContainer.querySelectorAll('.player')

        for (const container of containers) {
            this.player[container.id] = {
                element: container, 
                id: container.id
            }
        }

        this.#iFrameCreation()

        carousel.items.forEach(item => {
            const foundPlayer = item.querySelector('.player')
            if (foundPlayer) {
                item.addEventListener('mouseenter', e => this.onHover(foundPlayer))
                item.addEventListener('mouseleave', e => this.onPointerOut(foundPlayer))
            }
        })
    }

    #iFrameCreation() {
        const iframe = document.getElementById('videoIFrame')

        if (!iframe) {
            const tag = document.createElement('script')

            tag.src = 'https://www.youtube.com/iframe_api'
            tag.setAttribute('id', 'videoIFrame')
            tag.type = 'text/javascript'
            tag.loading = 'lazy'
            tag.referrerPolicy = 'no-referrer'
            // tag.type =  'image/svg+xml'
            
            window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this)

            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        } else {
            e => this.loadVideo.bind(this)
        }
    }

    onPlayerError(e) {
        console.log(e)
        console.log('erreur')
    }

    // get getPlayId() {
    //     return this.id.push(this.player.id)
    // }

    /**
     * Permet de pause l'animation lors d'un mouse hover
     * @param {PointerEvent} e 
     */
    onHover(element) {
        const elem = element.id
        if (this.player[elem].event.data !== 1 && this.done) {
            if (this.carousel.getLoadingBar) this.carousel.getLoadingBar.style.animationPlayState = 'paused'
            this.done = false
            this.player[elem].player.playVideo()
        }
    }

    /**
     * Relance l'animation quand le pointer est enlevé de l'item
     * @param {PointerEvent} e 
     */
    onPointerOut(element) {
        const elem = element.id
        if (this.player[elem].event.data === 1 && !this.done) {
            this.carousel.setPromiseArray = []
            this.player[elem].player.pauseVideo()
        }
        this.done = true
    }

    // 4. The API will call this function when the video player is ready.
    onPlayerReady(event) {
        event.target.playVideo()
        event.target.pauseVideo()
        this.player[event.target.o.id].event = event
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    onPlayerStateChange(event) {
        this.player[event.target.o.id].event = event
    }

    onYouTubeIframeAPIReady() {
        for (const container in this.player) {
            const player = new YT.Player(container, {
                // width: '360',
                width: '100%',
                height: '100%',
                mute: '1',
                allowfullscreen: '1',
                fullscreen: '1',
                // height: '720',
                videoId: container,
                playerVars: { 'autoplay': 0, 'controls': 0 , 'enablejsapi': 1, 'modestbranding': 1, 'rel': 0 },
                events: {
                    'onReady': this.onPlayerReady.bind(this),
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': this.onPlayerError.bind(this)
                }
            })
            // this.player[container].player = {...player}
            this.player[container].player = player
        }
    }

    get videoStatus() {
        return this.done
    }
}