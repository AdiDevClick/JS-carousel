import { CarouselVideoPlugin } from "./CarouselVideoPlugin.js"

export class YoutubePlayer {

event = []
playing = false
player

events = {
    width: '100%',
    height: '100%',
    videoId: 'UzRY3BsWFYg',
    playerVars: { 'autoplay': 0, 'controls': 0 },
    events: {
        'onReady': e => {
            this.event = e
            this.onPlayerReady(this.event)
        },
        // 'onReady': e => { if (this.video.getHoverStatus) this.onPlayerReady(e) },
        // 'onReady': e => this.onPlayerReady(e),
        // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
        'onStateChange': e => this.onPlayerStateChange(e),
        // 'onStateChange': e => {
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
     * @param {CarouselVideoPlugin} item 
     */
    constructor(item) {
        
        // this.#loadScript(this.#url, this.#globalName)
        //     .then(() => console.log('YT API Loaded. Youtube embedded is now ready.'))
        this.#iFrameCreation(item)
        this.video = item
        // console.log(carousel)
        // this.#loadScript()
        // this.onYouTubeIframeAPIReady()
    }

    #iFrameCreation(e) {
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
        const player = document.getElementById('player')
        // if (player) {
            this.player = new window.YT.Player(player, this.events) 
        // } else {
            // return
        // }
    }

    // 4. The API will call this function when the video player is ready.
    onPlayerReady(e) {
        // this.eventi = event
        console.log('je demander a lancer')
        // console.log(this.eventi)
        console.log(this.event)
        // e.target.playVideo()
        if (e.data !== YT.PlayerState.PLAYING && this.video.getDoneStatus === true && this.video.getHoverStatus) {
        // if (this.video.getHoverStatus) {
            console.log(e)
            console.log('je lance la video')
            this.video.setDoneStatus = false
            e.target.playVideo()
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
        // console.log('event du plyers state : ' + event + event.data + this.event)
        // if (event.data !== YT.PlayerState.PLAYING && this.video.done !== false && this.video.getHoverStatus) {
        //     console.log('je lance la video')
        //     event.target.playVideo()
        // }
        console.log('je suis dans playerstatechange')
        if (event.data === YT.PlayerState.PLAYING || YT.PlayerState.PAUSE && !this.video.getDoneStatus ) {
            setTimeout(e => this.stopVideo(e), 12000)
            console.log('je dois stop')
        }
    }

    stopVideo() {
        console.log('video stoped')
        this.player.stopVideo()
        this.video.setDoneStatus = true
    }

    pauseVideo() {
        console.log('video paused')
        this.player.pauseVideo()
        this.video.setDoneStatus = true
    }

    get getOnPlayerReady() {
        // if (this.event) {
            return this.onPlayerReady(this.event)
        // }
    }

    get getStopVideo() {
        // if (this.player) {
            console.log(this.event)
            return this.stopVideo()
        // }
    }

    get getPauseVideo() {
        // if (this.player) {
            console.log(this.event)
            return this.pauseVideo()
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