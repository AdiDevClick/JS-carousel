import { Carousel } from "./Carousel.js"
import { CarouselVideoPlugin } from "./CarouselVideoPlugin.js"

export class YoutubePlayer {

hovered = false
event
playing = false
player = []
videoPlayer = []
item = []
done = true
// id 
videoId
video = []
// isHovered


// events = {
//     // width: '360',
//     width: '100%',
//     height: '100%',
//     allowfullscreen: '1',
//     fullscreen: '1',
//     // height: '720',
//     // videoId: 'a8k8R0Q2ubY',
//     videoId: this.videoId,
//     // videoId: 'this.videoId',
//     // videoId: `${this.videoId}`,
//     playerVars: { 'autoplay': 0, 'controls': 0 , 'enablejsapi': 1, 'modestbranding': 1, 'rel': 0 },
//     events: {
//         // 'onReady': e => {
//         //     // this.event.push(e)
//         //     this.event = e
//         //     this.onPlayerReady(e)
//         // },
//         // 'onReady': e => { if (this.video.getHoverStatus) this.onPlayerReady(e) },
//         // 'onReady': this.onPlayerReady,
//         'onReady': e => this.onPlayerReady(e),
//         // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
//         'onStateChange': e => this.onPlayerStateChange(e),
//         // 'onStateChange': this.onPlayerStateChange,
//         // 'onStateChange': e => {
//         //     // this.event.push(e)
//         //     this.event = e
//         //     this.onPlayerStateChange(e)
//         // } ,
//         // 'onError': onPlayerError
//     }
// }
// done = false
// #url = "https://www.youtube.com/iframe_api"
// #globalName = window.YT

    /**
     * @param {Carousel} carousel
     */
    constructor(carousel) {
        this.carousel = carousel
        this.videoContainer = carousel.container
        // this.isHovered = carousel.getHoverStatus
        // this.item = carousel

        this.#iFrameCreation()

        // const container = this.videoContainer.querySelectorAll('.player')
        this.player = new YoutubeDisplayPlayer(this.videoContainer)

        // for (let index = 0; index < container.length; index++) {
        //     const element = container[index]
        //     this.player[index] = new YoutubeDisplayPlayer(element)
        // }

        // this.videoContainer.querySelectorAll('.player').forEach(player => {
        //     // window.onYouTubeIframeAPIReady = new YoutubeDisplayPlayer(player)
        //     // this.id.push(player.getAttribute('id'))
        //     this.player = new YoutubeDisplayPlayer(player)
        // })

        // console.log(this.carousel.container.player)
        const test = this.carousel.container.querySelector('.player')
        console.log(test)

        

        this.carousel.items.forEach(item => {
            // console.log(item)
            this.#createEventListenerFromHover(item , 'mouseover' , 'videoplay', this.player.onHover(item))
            this.#createEventListenerFromHover(item , 'mouseout' , 'videopause', this.player.onPointerOut(item))
            // item.addEventListener('videoplay', (e) => {
            //     console.log(e)
            //     console.log('customeventdsqdssssssssssssssssssssssssssssssssssssssssssssssssssssss')
            // })
        })
        
        // console.log(this.player)
        // if (this.player) 
        // console.log(this.carousel)
        // console.log(this.item)
        // this.id = item.getElementById('player-id')
        // carousel.items.forEach(item => {
        //     this.id = item.getElementById('player-id')
        // })
        // let id
        // carousel.container.querySelectorAll('.player')
        //     .forEach(element => 
        //         this.id = element.getAttribute('id').split('#')[1]
        //     )


        // const players = this.carousel.querySelectorAll('.player')
        // if (players) {
        //     players.forEach(player => {
        //         const id = player.getAttribute('id')
        //         this.id.push(id)
        //         console.log(player)
        //         player.addEventListener('mouseDebounce', (e) => {
        //             console.log(e)
        //             let test = e.detail.object
        //             console.log(test)
        //             console.log('test')
        //         })
        //         // this.id.push('#' + id.split('#')[1])
        //     })
        // }
        
        // this.carousel.querySelectorAll('.player').forEach(player => {
            
        // })


        // players ? console.log(this.id) : console.log('object')
        
        // carousel.container.querySelectorAll('id').forEach(element => id = element.getAttribute('id'))
        // console.log(id)
        // const playerId = id
        // console.log(playerId)
        // this.id = '#' + id.split('#')[1]
        // console.log(target)
        // if (playerId.startsWith('#')) {
        // modal = document.querySelector(href)
        // if (String.startsBy('player'))
        
        // carousel.element.querySelectorAll(target).forEach(id => {
        //     this.id = id
        // })
        
        
        // this.#loadScript(this.#url, this.#globalName)
        //     .then(() => console.log('YT API Loaded. Youtube embedded is now ready.'))

        // window.onYouTubeIframeAPIReady = e => this.loadVideo(e)
        // this.video = items
        
        // console.log(carousel)
        // this.#loadScript()
        // this.onYouTubeIframeAPIReady()
    }

    #iFrameCreation() {
        const iframe = document.getElementById('videoIFrame')

        if (!iframe) {
            const tag = document.createElement('script')

            tag.src = 'https://www.youtube.com/iframe_api'
            tag.setAttribute('id', 'videoIFrame')
            tag.type = 'text/javascript'
            // tag.loading = 'lazy'
            tag.referrerPolicy = 'no-referrer'
            // tag.type =  'image/svg+xml'
            // console.log('object')
            // window.onYouTubeIframeAPIReady = this.loadVideo.bind(this)
            
            
            // this.done = window.done
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        } else {
            // this.loadVideo.bind(this)
            e => this.loadVideo(e)
            // this.loadVideo()
            // console.log(e)
        }
    }

    #createEventListenerFromHover(object, eventToListen , customEvent, funct = null, args = null) {
        object.addEventListener(eventToListen, (e) => {
            if (funct) funct(args)
            // console.log('je test mon eventcreateur')
            let newEvent = new CustomEvent(`${customEvent}`, {
                bubbles: true,
                detail: {e, object}
            }, {once: true})

            object.dispatchEvent(newEvent)
        })
    }

    // #loadScript(scriptUrl, globalName) {
    //     if (globalName && window[globalName]) return Promise.resolve()

    //     return new Promise((resolve, reject) => {
    //         // const iframe = document.getElementById('videoIFrame')
            
    //         if (!this.#globalName) { 
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
    //                 resolve(window.onYouTubeIframeAPIReady = e => this.loadVideo(e)) :
    //                 reject(Error('window.' + globalName + ' undefined'))
    //             })

    //             scr.onerror = () => reject(Error('Error loading ' + globalName||scriptUrl))
                
    //         } else {
    //             e => this.loadVideo(e)
    //         }
    //     })
    // }

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
    

    

    

    

    

    

    

    

    

    // get getOnPlayerReady() {
    //     // console.log('je suis dans le getter, voici le player : ' +this.player + this.event.target)
    //     // if (this.player) {
    //         // console.log('jai utiliser mon play getter')
    //         // return this.loadVideo(this.event)
    //         // return this.event.target.playVideo()
    //         return this.onPlayerReady(this.event[0])
    //     // }
    // }

    // get getPlayerEvent() {
    //     return this.event
    // }

    

    // get getStopVideo() {
    //     // if (this.player) {
    //         console.log(this.player)
    //         let playEvent = this.getPlayerEvent
    //         console.log('jai utiliser mon stop getter')
    //         // this.stopVideo(this.event)
    //         this.stopVideo(playEvent)
    //         // this.stopVideo.bind(this)
    //     // }
    // }

    // get getPauseVideo() {
    //     // if (this.player) {
    //         console.log(this.videoPlayer)
    //         let playEvent = this.getPlayerEvent

    //         console.log('jai utiliser mon pause getter')
    //         // this.pauseVideo.bind(this)
    //         // this.pauseVideo(this.event)
    //         this.pauseVideo(playEvent)
    //         // this.pauseVideo()
    //     // }
    // }
}

class YoutubeDisplayPlayer 
{

    videoPlayer = []
    players = []

    constructor(container) {
        this.container = container

        // const test = container.querySelector('.player')
        //     console.log(test)
        const containers = this.container.querySelectorAll('.player')
        console.log(containers)
        containers.forEach(element => {
            const container = element.querySelectorAll('.player')
            this.player = container
            window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this)

            // const test = element.querySelector('.player')
        })



        // this.id = player.id
        // this.ids.push(this.id)
        // console.log(this.ids)
        // if (this.ids !== player.id) {
        //     console.log('on va voir un new id')
        //     this.newerId = player.id
        //     this.deux.push(this.newerId)
        // }
        // // this.getPlayId
        // console.log(this.deux)
        // console.log(this.ids)
        
        // this.id.push(id)

        console.log(this.id)
        // this.id.push(player.id)



        // window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this)
        // e => this.onYouTubeIframeAPIReady.bind(this)
        // this.onYouTubeIframeAPIReady()
    }

    playVideo(e) {
        // console.log('je demande a play la video, data dans le playvid : ' + e.target)
        // if (this.video.getHoverStatus === true) {
        // if (this.video.getHoverStatus) {
        // if (this.isHovered === true) {
            console.log(e)
            console.log(this.players)
            console.log('play on hover')
            this.players.playVideo()
            // this.event.target.playVideo()
            // this.player.playVideo()
            this.done  = false
            // return this.onPlayerStateChange(event)
        // return
        // }
        // return
        // this.onPlayerStateChange(e)
    }

    get getOnPlayerReady() {
        // console.log('je suis dans le getter, voici le player : ' +this.player + this.event.target)
        // if (this.player) {
            console.log(this.player)

            console.log('jai utiliser mon play getter')
            let playEvent = this.getPlayerEvent
            // return this.loadVideo(this.event)
            // return this.event.target.playVideo()
            this.playVideo(playEvent)
            // this.playVideo()
            // this.playVideo(playEvent)
            // this.playVideo.bind(this)
            // e => e.target.playVideo()
        // }
    }

    onPlayerError(e) {
        console.log(e)
        console.log('erreur')
    }

    

    get getPlayId() {
        return this.id.push(this.player.id)
    }

    /**
     * Permet de pause l'animation lors d'un mouse hover
     * @param {PointerEvent} e 
     */
    onHover(element) {
        const foundPlayer = element.querySelector('.player')
        // console.log(element)
        console.log(foundPlayer)
        if(foundPlayer) {
            element.addEventListener('videoplay', (e) => {
                
                const player = e.detail.object.querySelector('.player')
                // if (player.id === this.videoPlayer.id) {
                    console.log(player.id)
                    console.log(this.event.target)
                    
                    this.event.target.playVideo()
                    // this.onPlayerReady(this.videoPlayer)
                    // this.playVideo.bind(this)
                }
            )
        // } else {
            // return null
        }
        // return null
    }

    getVideoPlayerById(videoPlayerId, playerId) {
        if (playerId === videoPlayerId) {
            this.playVideo()
        } else {

        }
    }

    /**
     * Relance l'animation quand le pointer est enlevé de l'item
     * @param {PointerEvent} e 
     */
    onPointerOut(element) {
        // console.log(element)
        // console.log('jai demander de pause la video')
        this.container.addEventListener('videopause', (e) => {
            // console.log(e)
            // console.log('je de hover')
        })
        // element.pauseVideo()
        // this.pauseVideo()
        // !this.hovered ? this.carousel.getVideoPlayer.getPauseVideo : null
        // !this.#hovered ? this.carousel.getVideoPlayer.getPauseVideo : null
        // this.#hovered ? this.player.onPlayerStateChange(this.player) : null
        // !this.#hovered && this.carousel.getVideoPlayer ? this.carousel.getVideoPlayer.getPauseVideo : null
        // this.#hovered ? this.player.onPlayerStateChange(this.player) : null
    }

    // 4. The API will call this function when the video player is ready.
    onPlayerReady(event) {
        // console.log(this.video.getHoverStatus)
        // if (!this.done) return
        // const embedCode = e.target.getVideoEmbedCode()
        // e.target.playVideo()
        // if (document.getElementById('embed-code')) {
        //     document.getElementById('embed-code').innerHTML = embedCode
        //     console.log(embedCode)
        // }
        // console.log(embedCode)
        // this.event.push(e)
        console.log('je suis dans oinplyer')
        this.event = event
        console.log(this.event)
        console.log(this.players)
        // event.target.playVideo()
        // console.log(e)
        // e.target.playVideo()
        // if (e.data !== window.YT.PlayerState.PLAYING && (this.done !== false && this.video.getHoverStatus)) {
        // if (event.data !== YT.PlayerState.PLAYING) {
        if (event.data !== YT.PlayerState.PLAYING) {
            
                // console.log(e)
                this.event = event
                this.done = false
                // this.onPlayerStateChange()
                
                // this.playVideo(event)
                // event.target.playVideo()
                console.log('je lance la video')
                // setTimeout(e => this.playVideo(e), 500)
                // return this.onPlayerStateChange(event)
                // return console.log('object')
                // this.onPlayerStateChange(event)
                // this.onPlayerStateChange.bind(this)
            // }
        } else {
            // this.onPlayerStateChange(event)
            // this.onPlayerStateChange.bind(this)
        }
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    onPlayerStateChange(event) {
        // if (event.data === window.YT.PlayerState.PAUSED || window.YT.PlayerState.ENDED && this.video.getHoverStatus) {
        //     event.target.playVideo()
        //     console.log('je lance la video')
        //     this.video.done = false
        // if (!this.video.getHoverStatus) {
        // if (this.done) return this.onPlayerReady(event)
        //     return e => onPlayerStateChange(e)
        console.log('je suis dans le playerstate')
        this.event = event
        console.log(this.event)
            // console.log(this.video.getHoverStatus)
        // }
        // console.log('event du plyers state : ' + event + event.data + this.event)
        if (event.data === YT.PlayerState.PLAYING && !this.done) {
        // if (event.data === YT.PlayerState.PLAYING && !this.done && !this.item.getHoverStatus) {
            this.done  = true
            // this.event.target.pauseVideo()
            // setTimeout(e => this.pauseVideo(e), 3000)
            // setTimeout(e => this.pauseVideo(this.event), 3000)
            console.log('je pause la video')
            // return
        // } else if (event.data === YT.PlayerState.PLAYING || YT.PlayerState.PAUSE && !this.done && !this.video.getHoverStatus) {
            // event.target.playVideo()
            // setTimeout(e => this.stopVideo(e), 3000)
            // setTimeout(e => this.stopVideo(this.event), 3000)
            // console.log('je dois stop')
            // return
        } 
        // else {
        //     this.done = true
        //     return this.onPlayerReady.bind(this)
        //     // return this.onPlayerStateChange(event)
        // }
    }

    stopVideo(e) {
        // console.log('je demande a stop la video, data dans le playvid : ' + e.target)
        // if (!this.video.getHoverStatus) {
        // if (this.isHovered === false) {
            console.log(this.players)
            console.log('video stop')
            e.target.stopVideo()
            // this.event.target.stopVideo()
            // this.player.stopVideo()
            this.done  = true
            // return this.onPlayerStateChange.bind(this)
        // }
        
        // return
        // return this.onPlayerStateChange.bind(this)
    }

    pauseVideo(e) {
        // console.log('je demande a pause la video, data dans le playvid : ' + e.target)
        // console.log(e)
        // console.log(this.isHovered)
        console.log(e)
        console.log(this.players)
        // console.log(this.item.getHoverStatus)
        // if (this.video.getHoverStatus === false) {
        // if (!this.isHovered) {
        // if (!this.video.getHoverStatus) {
            // console.log(this.isHovered)
            console.log('pause not on hover')
           
            e.target.pauseVideo()
            // e.pauseVideo()
            // this.event.target.pauseVideo()
            // this.player.pauseVideo()
            // return this.onPlayerStateChange.bind(this)
        this.done  = true
        // return
        // }
        // return
        // return this.onPlayerStateChange.bind(this)
    }

    onYouTubeIframeAPIReady() {
        // // this.getPlayId
        // console.log(this.player)
        // console.log(this.id)
        // this.video.addEventListener('videocheck', (e) => {
        //     const player = e.detail.object.querySelector('.player')
        //     // this.id = player.getAttribute('id')
        //     console.log('je check lid')
        //     console.log(player)
        //     console.log(this.id)
        //     // const id = player.getAttribute('id')
        // })
        // const player = object.querySelector('.player')
        // const id = player.getAttribute('id')
        // if (!this.videoPlayer && player) {
            // console.log(this.player)
            // console.log(this.id)
            console.log('creation du player')
            const containers = this.container.querySelectorAll('.player')
            // console.log(this.id)
            containers.forEach(container => {
            // this.id.forEach(id => {



            //     // console.log(id)
            //     // this.videoId = id
                // if (this.player) {
                        // this.videoPlayer = new YT.Player(container.id, {
                        this.videoPlayer.push(new window.YT.Player(container.id, {
                        // width: '360',
                        width: '100%',
                        height: '100%',
                        allowfullscreen: '1',
                        fullscreen: '1',
                        // height: '720',
                        videoId: container.id,
                        playerVars: { 'autoplay': 0, 'controls': 0 , 'enablejsapi': 1, 'modestbranding': 1, 'rel': 0 },
                        events: {
                            'onReady': this.onPlayerReady.bind(this),
                            // 'onReady': e => this.onPlayerReady(e),
                            // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                            'onStateChange': this.onPlayerStateChange.bind(this),
                            'onError': this.onPlayerError.bind(this)
                        }
                        }))
                    
                // } 
                // this.videoPlayer.forEach(element => {
                //     element.id = container.id
                // })
                // this.videoPlayer.id = container.id

                // this.players.push(this.videoPlayer)
                console.log(this.videoPlayer)
                // console.log(this.videoPlayer.id[1])
                // if (this.videoPlayer.g.id !== this.player.id) {
                //     console.log('object')
                //     this.videoPlayer = new YT.Player(this.player.id, {
                //         // width: '360',
                //         width: '100%',
                //         height: '100%',
                //         allowfullscreen: '1',
                //         fullscreen: '1',
                //         // height: '720',
                //         videoId: this.player.id,
                //         playerVars: { 'autoplay': 0, 'controls': 0 , 'enablejsapi': 1, 'modestbranding': 1, 'rel': 0 },
                //         // events: {
                //         //     'onReady': this.onPlayerReady.bind(this),
                //         //     // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                //         //     'onStateChange': this.onPlayerStateChange.bind(this),
                //         //     'onError': this.onPlayerError.bind(this)
                //         // }
                //     }) 
                // }
            })

            
            // console.log(players)
            // this.carousel.getVideoPlayer && this.#hovered ? this.carousel.getVideoPlayer.getOnPlayerReady: null


            // this.hoverPlugin.addEventListener('mouseDebounce', (e) => {
            //     const player = e.detail.object.querySelector('.player')
            //     if (player) {
            //         this.videoPlayer = new YT.Player(player.getAttribute('id'), {
            //             // width: '360',
            //             width: '100%',
            //             height: '100%',
            //             allowfullscreen: '1',
            //             fullscreen: '1',
            //             // height: '720',
            //             videoId: player.getAttribute('id'),
            //             playerVars: { 'autoplay': 0, 'controls': 0 , 'enablejsapi': 1, 'modestbranding': 1, 'rel': 0 },
            //             events: {
            //                 'onReady': e => this.onPlayerReady(e),
            //                 // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
            //                 'onStateChange': this.onPlayerStateChange.bind(this),
            //                 'onError': this.onPlayerError.bind(this)
            //             }
            //         }) 
            //     // console.log(e.detail.object.querySelector('.player').getAttribute('id'))
            //     }
            //     // return this.videoPlayer
            // })
        // console.log(this.videoPlayer)
        

        // } else {
        //     // console.log('le player existe deja')
        //     // this.player.bind(this)
        //     // return
        // }
        // console.log(this.player)
    }
}

// var tag = document.createElement('script');

// tag.src = "https://www.youtube.com/iframe_api";
// var firstScriptTag = document.getElementsByTagName('script')[0];
// firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// // 3. This function creates an <iframe> (and YouTube player)
// //    after the API code downloads.
// var player;
// function onYouTubeIframeAPIReady() {
//     player = new YT.Player('player', {
//         videoId: 'UzRY3BsWFYg',
            // playerVars: { 'autoplay': 1, 'controls': 0 },
            // events: {
                // onReady: e => this.onPlayerReady(e),
                // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                // onStateChange: e => this.onPlayerStateChange(e),
                // 'onError': onPlayerError
            // }
//     })
//     console.log(player)
// }

// // 4. The API will call this function when the video player is ready.
// function onPlayerReady(event) {
//     event.target.playVideo()
// }

//       // 5. The API calls this function when the player's state changes.
//       //    The function indicates that when playing a video (state=1),
//       //    the player should play for six seconds and then stop.
// var done = false
// function onPlayerStateChange(event) {
//     if (event.data == YT.PlayerState.PLAYING && !done) {
//         setTimeout(stopVideo, 6000)
//         done = true
//     }
// }
// function stopVideo() {
//     player.stopVideo()
// }