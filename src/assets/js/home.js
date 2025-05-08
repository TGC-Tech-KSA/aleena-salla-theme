import "lite-youtube-embed";
import BasePage from "./base-page";
import Lightbox from "fslightbox";
window.fslightbox = Lightbox;

class Home extends BasePage {
  onReady() {
    this.initFeaturedTabs();
    this.circleBullets();
    this.testGInsta();
  }

  /**
   * used in views/components/home/featured-products-style*.twig
   */
  initFeaturedTabs() {
    app.all('.tab-trigger', (el) => {
      el.addEventListener('click', ({ currentTarget: btn }) => {
        let id = btn.dataset.componentId;
        // btn.setAttribute('fill', 'solid');
        app
          .toggleClassIf(
            `#${id} .tabs-wrapper>div`,
            'is-active opacity-0 translate-y-3',
            'inactive',
            (tab) => tab.id == btn.dataset.target
          )
          .toggleClassIf(
            `#${id} .tab-trigger`,
            'is-active',
            'inactive',
            (tabBtn) => tabBtn == btn
          );

        // fadeIn active tabe
        setTimeout(
          () =>
            app.toggleClassIf(
              `#${id} .tabs-wrapper>div`,
              'opacity-100 translate-y-0',
              'opacity-0 translate-y-3',
              (tab) => tab.id == btn.dataset.target
            ),
          100
        );
      });
    });
    document
      .querySelectorAll('.s-block-tabs')
      .forEach((block) => block.classList.add('tabs-initialized'));
  }

  circleBullets() {
    function addSVGToBullets() {
      document
        .querySelectorAll('.home-main-slider .swiper-pagination-bullet')
        .forEach(function (bullet) {
          if (!bullet.querySelector('svg')) {
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
    document.addEventListener('DOMContentLoaded', addSVGToBullets);
    // restartAutoplayOnClick
    function restartAutoplayOnClick(swiperInstance, sliderElement) {
      sliderElement
        .querySelectorAll('.swiper-pagination-bullet ,.s-slider-nav-arrow')
        .forEach((bullet) => {
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
      document
        .querySelectorAll('.home-main-slider')
        .forEach((sliderElement) => {
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

    // //////
document.addEventListener('click', function (event) {
  let button = event.target.closest('.hotspot__btn');
  if (!button) return;

  let hotspot = button.closest('.hotspot');
  let hotspotCard = hotspot.querySelector('.hotspot__card');
  let span = button.querySelector('.hotspot__btn-number');

  let isOpen = hotspotCard.classList.contains('active');

  // إغلاق جميع البطاقات الأخرى وإزالة التنسيقات
  document.querySelectorAll('.hotspot__card').forEach((card) => {
    card.classList.remove('active');
    card.setAttribute('aria-hidden', 'true');
  });

  document.querySelectorAll('.hotspot__btn').forEach((btn, index) => {
    btn.classList.remove('is-open');
    let el = btn.querySelector('.hotspot__btn-number');
    el.innerHTML = index + 1;
  });

  if (!isOpen) {
    hotspotCard.classList.add('active');
    hotspotCard.setAttribute('aria-hidden', 'false');

    // تغيير المحتوى والخلفية
    button.classList.add('is-open');
    span.innerHTML = '&times;';
  }
});


  }
  testGInsta() {
    const openButtons = document.querySelectorAll('.open-video-popup');
    const popup = document.getElementById('video-popup');
    const closePopupBtn = document.getElementById('close-popup');
    const videos = document.querySelectorAll('.story-video');
    const ownerTexts = document.querySelectorAll('.story-video + span');
    const closeVideoBtns = document.querySelectorAll('.close-video');
    openButtons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        popup.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          const target = videos[index];
          const ownerText = ownerTexts[index];
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.src = target.dataset.src;
            target.play().catch(() => {});
            target.muted = false;
            if (ownerText) {
              ownerText.classList.remove('hidden');
            }
          }
        }, 100);
      });
    });

    closePopupBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
      document.body.style.overflow = 'auto';
      videos.forEach((v) => {
        v.pause();
        v.muted = true;
      });
      ownerTexts.forEach((text) => text.classList.add('hidden'));
    });

    closeVideoBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const video = videos[index];
        video.pause();
        video.muted = true;
        video.currentTime = 0;
        popup.classList.add('hidden');
        ownerTexts[index].classList.add('hidden');
        document.body.style.overflow = 'auto';
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          const ownerText = document.getElementById(
            `owner-${video.dataset.index}`
          );
          if (entry.isIntersecting) {
            videos.forEach((v) => {
              if (v !== video) {
                v.pause();
                v.muted = true;
              }
            });
            if (!video.src) video.src = video.dataset.src;
            video.muted = false;
            video.play().catch(() => {});
            if (ownerText) ownerText.classList.remove('hidden');
          } else {
            video.pause();
            video.muted = true;
            if (ownerText) ownerText.classList.add('hidden');
          }
        });
      },
      {
        root: popup,
        threshold: 0.8
      }
    );
    videos.forEach((video) => observer.observe(video));
  }
}

Home.initiateWhenReady(['index']);
