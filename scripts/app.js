import { Carousel } from "./components/Carousel.js"

// window.addEventListener('DOMContentLoaded', () => {
//     new Carousel(document.querySelector('#carousel1'), {
//         slidesToScroll: 2,
//         visibleSlides: 3,
//         pagination: true,
//         loop: true
//     })
//     new Carousel(document.querySelector('#carousel2'), {
//         slidesToScroll: 2,
//         visibleSlides: 2,
//         pagination: true,
//         loop: true
//     })
//     new Carousel(document.querySelector('#carousel3'), {
//         pagination: true,
//     })

//     new Carousel(document.querySelector('#carousel4'), {
//         slidesToScroll: 2,
//         visibleSlides: 3,
//         infinite: true,
//     })
// })

const onReady = function() {
    new Carousel(document.querySelector('#carousel1'), {
        slidesToScroll: 2,
        visibleSlides: 2,
        loop: true,
        pagination: true,
        autoSlideDuration: 3000,
        afterClickDelay: 5000
    })
    new Carousel(document.querySelector('#carousel2'), {
        slidesToScroll: 3,
        visibleSlides: 3,
        infinite: true,
        pagination: true,
        automaticScrolling: true,
        autoSlideDuration: 3000,
        afterClickDelay: 10000
    })
    new Carousel(document.querySelector('#carousel3'), {
        slidesToScroll: 2,
        visibleSlides: 3,
        loop: true,
        automaticScrolling: false
    })
    new Carousel(document.querySelector('#carousel4'), {
        slidesToScroll: 3,
        visibleSlides: 4,
        automaticScrolling: false,
        loop: true
    })
    new Carousel(document.querySelector('#carousel5'), {
        slidesToScroll: 1,
        visibleSlides: 1,
        automaticScrolling: false,
        loop: true,
    })
}

if (window.readyState !== 'loading') {
    onReady()
}
window.addEventListener('DOMContentLoaded', onReady)
