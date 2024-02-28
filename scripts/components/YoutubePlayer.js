export class YoutubePlayer {

events = {
    width: '100%',
    height: '100%',
    videoId: 'UzRY3BsWFYg',
    playerVars: { 'autoplay': 1, 'controls': 0 },
    events: {
        'onReady': e => this.onPlayerReady(e),
        // 'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
        'onStateChange': e => this.onPlayerStateChange(e),
        // 'onError': onPlayerError
    }
}
// done = false
// #url = "https://www.youtube.com/iframe_api"
// #globalName = window.YT

    constructor(carousel) {
        this.video = carousel
        // this.#loadScript(this.#url, this.#globalName)
        //     .then(() => console.log('YT API Loaded. Youtube embedded is now ready.'))
        this.#iFrameCreation(carousel)
        // this.#loadScript()
        // this.onYouTubeIframeAPIReady()
    }

    #iFrameCreation(e) {
        const iframe = document.getElementById('videoIFrame')

        if (!iframe) {
            const tag = document.createElement('script')

            tag.src = "https://www.youtube.com/iframe_api"
            tag.setAttribute('id', 'videoIFrame')
            
            window.onYouTubeIframeAPIReady = e => this.loadVideo(e)
            // this.done = window.done
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
            
        } else {
            e => this.loadVideo(e)
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
        this.player = new window.YT.Player('player', this.events)
    }

    // 4. The API will call this function when the video player is ready.
    onPlayerReady(event) {
        // if (event.data !== YT.PlayerState.PLAYING && !this.done) {
        //     console.log('test')
            event.target.playVideo()
        // } else {
        //     return
        // }
    }

    // 5. The API calls this function when the player's state changes.
    //    The function indicates that when playing a video (state=1),
    //    the player should play for six seconds and then stop.
    onPlayerStateChange(event) {
        if (event.data === window.YT.PlayerState.PLAYING && !this.ca.done) {
            setTimeout(e => this.stopVideo(e), 3000)
            // console.log('video done')
            
        } else {
            this.video.done = false
            // event.target.playVideo()
        }
    }

    stopVideo(e) {
        console.log('video stoped')
        this.player.stopVideo()
        this.video.done = true
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