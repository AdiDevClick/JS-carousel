import { Carousel } from "./Carousel.js"
import { CarouselVideoPlugin } from "./CarouselVideoPlugin.js"

export class YoutubePlayer {

event
playing = false
player
done
id = []
videoId
// eventId = { videoId: this.videoId}


events = {
    // width: '360',
    width: '100%',
    height: '100%',
    allowfullscreen: '1',
    fullscreen: '1',
    // height: '720',
    // videoId: 'a8k8R0Q2ubY',
    videoId: this.videoId,
    // videoId: 'this.videoId',
    // videoId: `${this.videoId}`,
    playerVars: { 'autoplay': 0, 'controls': 0 , 'enablejsapi': 1, 'modestbranding': 1, 'rel': 0 },
    events: {
        // 'onReady': e => {
        //     // this.event.push(e)
        //     this.event = e
        //     this.onPlayerReady(e)
        // },
        // 'onReady': e => { if (this.video.getHoverStatus) this.onPlayerReady(e) },
        // 'onReady': this.onPlayerReady,
        'onReady': e => this.onPlayerReady(e),
        // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
        'onStateChange': e => this.onPlayerStateChange(e),
        // 'onStateChange': this.onPlayerStateChange,
        // 'onStateChange': e => {
        //     // this.event.push(e)
        //     this.event = e
        //     this.onPlayerStateChange(e)
        // } ,
        // 'onError': onPlayerError
    }
}
// done = false
// #url = "https://www.youtube.com/iframe_api"
// #globalName = window.YT

    /**
     * @param {Carousel} carousel
     */
    constructor(carousel) {
        this.video = carousel
        // this.id = item.getElementById('player-id')
        // carousel.items.forEach(item => {
        //     this.id = item.getElementById('player-id')
        // })
        // let id
        // carousel.container.querySelectorAll('.player')
        //     .forEach(element => 
        //         this.id = element.getAttribute('id').split('#')[1]
        //     )
        carousel.container.querySelectorAll('.player')
            .forEach(element => {
                const id = element.getAttribute('id')
                return this.id.push(id)
                // this.id.push('#' + id.split('#')[1])
            })
        // console.log(this.id)
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
        this.#iFrameCreation()
        // this.video = items
        this.isHovered = this.video.getHoverStatus
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

            window.onYouTubeIframeAPIReady = e => this.loadVideo(e)
            
            // this.done = window.done
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        } else {
            e => this.loadVideo(e)
            // this.loadVideo()
            // console.log(e)
        }
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
    loadVideo(e) {
        // const player = document.getElementById('player-id')
        // const id = this.id
        if (!this.player) {
            // console.log(this.id)
            console.log('creation du player')
            this.id.forEach(id => {
                // console.log(id)
                // this.videoId = id
                this.player = new YT.Player(id, {
                    // width: '360',
                    width: '100%',
                    height: '100%',
                    allowfullscreen: '1',
                    fullscreen: '1',
                    // height: '720',
                    // videoId: 'a8k8R0Q2ubY',
                    videoId: id,
                    // videoId: 'this.videoId',
                    // videoId: `${this.videoId}`,
                    playerVars: { 'autoplay': 0, 'controls': 0 , 'enablejsapi': 1, 'modestbranding': 1, 'rel': 0 },
                    events: {
                        // 'onReady': e => {
                        //     // this.event.push(e)
                        //     this.event = e
                        //     this.onPlayerReady(e)
                        // },
                        // 'onReady': e => { if (this.video.getHoverStatus) this.onPlayerReady(e) },
                        // 'onReady': this.onPlayerReady,
                        'onReady': e => this.onPlayerReady(e),
                        // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                        'onStateChange': e => this.onPlayerStateChange(e),
                        // 'onStateChange': this.onPlayerStateChange,
                        // 'onStateChange': e => {
                        //     // this.event.push(e)
                        //     this.event = e
                        //     this.onPlayerStateChange(e)
                        // } ,
                        // 'onError': onPlayerError
                    }
                }) 
                // this.player = new YT.Player(this.videoId, this.events) 
                // this.player.push(this.player)
                // new window.YT.Player('player-id'+id, this.events) 
            })
            // this.player = new window.YT.Player(this.id, this.events) 
            // this.player.push(videoPlayer)
            // console.log(this.id)
            // console.log(this.player)
        } else {
            console.log('le player existe deja')
            this.player
            // console.log(this.player)
        }
        
    }

    // 4. The API will call this function when the video player is ready.
    onPlayerReady(e) {
        // const embedCode = e.target.getVideoEmbedCode()
        // e.target.playVideo()
        // if (document.getElementById('embed-code')) {
        //     document.getElementById('embed-code').innerHTML = embedCode
        //     console.log(embedCode)
        // }
        // console.log(embedCode)
        // this.event.push(e)
        console.log('je demander a lancer')
        // console.log(this.event)
        // console.log(e)
        // e.target.playVideo()
        // if (e.data !== window.YT.PlayerState.PLAYING && (this.done !== false && this.video.getHoverStatus)) {
        if (e.data !== window.YT.PlayerState.PLAYING) {
        // if (this.video.getHoverStatus) {
            console.log(e)
            console.log('je lance la video')
            // this.done = false
            // e.target.playVideo()
            setTimeout(e => this.playVideo(e), 500)
            // return e => onPlayerStateChange(e)
        }
        // return e => onPlayerStateChange(e)
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
        //     return e => onPlayerStateChange(e)
            console.log(this.video.getHoverStatus)
        // }
        // console.log('event du plyers state : ' + event + event.data + this.event)
        if (event.data !== window.YT.PlayerState.PLAYING) {
            // e => this.pauseVideo(e)
            // setTimeout(e => this.playVideo(e), 500)
            setTimeout(e => this.playVideo(e), 500)
            console.log('je play la vid')
            // return
            // event.target.pauseVideo()
        } else if (event.data === window.YT.PlayerState.PLAYING && !this.done) {
            
            // event.target.playVideo()
            setTimeout(e => this.pauseVideo(e), 500)
            console.log('je pause la video')
            // return
        } else if (event.data === window.YT.PlayerState.PLAYING || window.YT.PlayerState.PAUSE && !this.done) {
            setTimeout(e => this.stopVideo(e), 22000)
            console.log('je dois stop')
            // return
        } else {
            return e => onPlayerStateChange(e)
        }
        
    }

    stopVideo(e) {
        console.log('video stoped')
        if (this.video.getHoverStatus === false) {
        // if (this.isHovered === false) {
            this.player.stopVideo()
            this.done  = true
            return e => onPlayerStateChange(e)
        }
        
        // return
        return e => onPlayerStateChange(e)
    }

    playVideo(e) {
        console.log('video play')
        if (this.video.getHoverStatus === true) {
        // if (this.isHovered === true) {
            console.log('play on hover')
            this.player.playVideo()
            this.done  = false
            return e => onPlayerStateChange(e)
        // return
        }
        // return
        return e => onPlayerStateChange(e)
    }

    pauseVideo(e) {
        console.log('video paused')
        if (this.video.getHoverStatus === false) {
        // if (this.isHovered === false) {
            console.log('pause not on hover')
            this.player.pauseVideo()
            return e => onPlayerStateChange(e)
        // this.done  = true
        // return
        }
        // return
        return e => onPlayerStateChange(e)
    }

    // get getOnPlayerReady() {
    //     // console.log('je suis dans le getter, voici le player : ' +this.player + this.event.target)
    //     // if (this.player) {
    //         // console.log('jai utiliser mon play getter')
    //         // return this.loadVideo(this.event)
    //         // return this.event.target.playVideo()
    //         return this.onPlayerReady(this.event[0])
    //     // }
    // }
    get getOnPlayerReady() {
        // console.log('je suis dans le getter, voici le player : ' +this.player + this.event.target)
        // if (this.player) {
            console.log('jai utiliser mon play getter')
            // return this.loadVideo(this.event)
            // return this.event.target.playVideo()
            e => this.playVideo(e)
            // e => e.target.playVideo()
        // }
    }

    get getStopVideo() {
        // if (this.player) {
            e => this.stopVideo(e)
        // }
    }

    get getPauseVideo() {
        // if (this.player) {
            e => this.pauseVideo(e)
        // }
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