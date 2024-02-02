import { Carousel2 } from "./components/Carousel2.js"

document.addEventListener('DOMContentLoaded', () => {
    new Carousel2(document.querySelector('#carousel1'), {
        slidesToScroll: 2,
        visibleSlides: 2,
        loop: true
    })
    new Carousel2(document.querySelector('#carousel2'), {
        slidesToScroll: 1,
        visibleSlides: 1,
        loop: false
    })
    new Carousel2(document.querySelector('#carousel3'), {
        slidesToScroll: 2,
        visibleSlides: 3
    })
    new Carousel2(document.querySelector('#carousel4'), {
        slidesToScroll: 3,
        visibleSlides: 3
    })
})