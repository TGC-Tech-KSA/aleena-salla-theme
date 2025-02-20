import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
    onReady() {
        this.initFeaturedTabs();
        this.circleBullets();
        this.playVideos();
    }

    /**
     * used in views/components/home/featured-products-style*.twig
     */
    initFeaturedTabs() {
        app.all('.tab-trigger', el => {
            el.addEventListener('click', ({ currentTarget: btn }) => {
                let id = btn.dataset.componentId;
                // btn.setAttribute('fill', 'solid');
                app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'is-active opacity-0 translate-y-3', 'inactive', tab => tab.id == btn.dataset.target)
                    .toggleClassIf(`#${id} .tab-trigger`, 'is-active', 'inactive', tabBtn => tabBtn == btn);

                // fadeIn active tabe
                setTimeout(() => app.toggleClassIf(`#${id} .tabs-wrapper>div`, 'opacity-100 translate-y-0', 'opacity-0 translate-y-3', tab => tab.id == btn.dataset.target), 100);
            })
        });
        document.querySelectorAll('.s-block-tabs').forEach(block => block.classList.add('tabs-initialized'));
    }

    circleBullets(){
    function addSVGToBullets() {
    document.querySelectorAll(".home-main-slider .swiper-pagination-bullet").forEach(function (bullet) {
        if (!bullet.querySelector("svg")) {
            bullet.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#fff" stroke-width="2"></circle>
                    <circle class="progress-ring" cx="18" cy="18" r="16" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="100" stroke-dashoffset="100"></circle>
                </svg>
            `;
        }
    });
    }
    const observer = new MutationObserver(addSVGToBullets);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", addSVGToBullets);
    // restartAutoplayOnClick
    function restartAutoplayOnClick(swiperInstance, sliderElement) {
        sliderElement.querySelectorAll('.swiper-pagination-bullet ,.s-slider-nav-arrow').forEach((bullet) => {
            bullet.addEventListener('click', function () {
                setTimeout(() => {
                if (swiperInstance && swiperInstance.autoplay) {
                    swiperInstance.autoplay.start();
                }
                }, 500);
            });
        });
    }

    function initializeAutoplayRestart() {
        document.querySelectorAll('.home-main-slider').forEach((sliderElement) => {
            let swiperInstance = sliderElement.querySelector('.swiper')?.swiper;
            if (swiperInstance) {
            restartAutoplayOnClick(swiperInstance, sliderElement);
            }
        });
    }

    const observerAll = new MutationObserver(() => {
    initializeAutoplayRestart();
    });
    observerAll.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', initializeAutoplayRestart);
    }
     playVideos() {
    document.addEventListener('DOMContentLoaded', function () {
  function playVideos() {
    var videos = document.querySelectorAll('.autoplay-video');
    if (videos.length > 0) {
      videos.forEach(video => {
        if (!video.playing) {
          video.play().catch(error => console.error("خطأ في تشغيل الفيديو:", error));
        }
      });
    }
  }

  // خاصية لمعرفة إذا كان الفيديو قيد التشغيل
  Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function () {
      return !!(
        this.currentTime > 0 &&
        !this.paused &&
        !this.ended &&
        this.readyState > 2
      );
    }
  });

  // تشغيل الفيديو عند تحميل الصفحة تلقائيًا
  playVideos();

  // تشغيل الفيديو عند الضغط على أي عنصر `<a>` يحتوي على `.instagram-play`
  document.querySelectorAll('a.instagram-play').forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault(); // منع السلوك الافتراضي للرابط
      playVideos();
    });
  });

  // تأكيد تشغيل الفيديوهات على الهواتف
  var mobileVideos = document.getElementsByClassName('autoplay-video');
  for (var i = 0; i < mobileVideos.length; i++) {
    mobileVideos[i].setAttribute('playsinline', '');
    mobileVideos[i].setAttribute('muted', '');
  }
});

  }

}

Home.initiateWhenReady(['index']);
