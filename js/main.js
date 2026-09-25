;(function () {
  'use strict';

  let mobileMenuOutsideClick = () => {
    $(document).click((e) => {
      let container = $("#fh5co-offcanvas, .js-fh5co-nav-toggle");
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        if ( $('body').hasClass('offcanvas') ) {
          $('body').removeClass('offcanvas');
          $('.js-fh5co-nav-toggle').removeClass('active');
        }
      }
    });
  };


  let offcanvasMenu = () => {
    $('#page').prepend('<div id="fh5co-offcanvas" />');
    $('#page').prepend('<a href="#" class="js-fh5co-nav-toggle fh5co-nav-toggle fh5co-nav-white"><i></i></a>');
    let clone1 = $('.menu-1 > ul').clone();
    let clone2 = $('.menu-2 > ul').clone();
    $('#fh5co-offcanvas').append(clone1);
    $('#fh5co-offcanvas').append(clone2);

    $(window).resize(() => {
      if ( $('body').hasClass('offcanvas') ) {
        $('body').removeClass('offcanvas');
        $('.js-fh5co-nav-toggle').removeClass('active');
      }
    });
  };


  let burgerMenu = () => {
    $('body').on('click', '.js-fh5co-nav-toggle', function(event) {
      let $this = $(this);

      if ( $('body').hasClass('overflow offcanvas') ) {
        $('body').removeClass('overflow offcanvas');
      } else {
        $('body').addClass('overflow offcanvas');
      }
      $this.toggleClass('active');
      event.preventDefault();
    });
  };


  let contentWayPoint = () => {
    var i = 0;
    $('.animate-box').waypoint(
      function(direction) {
        if(direction === 'down' && !$(this.element).hasClass('animated-fast')) {
          i++;

          $(this.element).addClass('item-animate');
          setTimeout(() => {
            $('body .animate-box.item-animate').each(function(k) {
              let el = $(this);
              setTimeout(() => {
                let effect = el.data('animate-effect');
                if ( effect === 'fadeIn') {
                  el.addClass('fadeIn animated-fast');
                } else if ( effect === 'fadeInLeft') {
                  el.addClass('fadeInLeft animated-fast');
                } else if ( effect === 'fadeInRight') {
                  el.addClass('fadeInRight animated-fast');
                } else {
                  el.addClass('fadeInUp animated-fast');
                }

                el.removeClass('item-animate');
              }, k * 200, 'easeInOutExpo');
            });
          }, 100);
        }
      },
      {
        offset: '85%',
      },
    );
  };


  let goToTop = () => {
    $('.js-gotop').on('click', (event) => {
      event.preventDefault();

      $('html, body').animate({
        scrollTop: $('html').offset().top
      }, 500, 'easeInOutExpo');

      return false;
    });

    $(window).scroll(() => {
      let $win = $(window);
      if ($win.scrollTop() > 200) {
        $('.js-top').addClass('active');
      } else {
        $('.js-top').removeClass('active');
      }
    });
  };


  // Loading page
  let loaderPage = () => {
    $(".fh5co-loader").fadeOut("slow");
  };

  // Timeline Carousel with Lazy Loading
  const initTimelineCarousels = () => {
    const carousels = document.querySelectorAll('.timeline-carousel');

    // Load images for a carousel from data-bg attributes
    const loadCarouselImages = (carousel) => {
      const slides = carousel.querySelectorAll('.carousel-slide[data-bg]');
      slides.forEach((slide) => {
        const bgUrl = slide.dataset.bg;
        if (bgUrl) {
          slide.style.backgroundImage = `url('${bgUrl}')`;
          slide.removeAttribute('data-bg');
        }
      });
      carousel.classList.add('loaded');
    };

    // Initialize auto-scroll for a carousel
    const initCarouselAutoScroll = (carousel) => {
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');

      // Skip if only 1 image
      if (slides.length <= 1) return;

      let currentIndex = 0;
      let intervalId = null;
      const autoScrollDelay = 3000; // 3 seconds

      const showSlide = (index) => {
        slides.forEach((s) => s.classList.remove('active'));
        dots.forEach((d) => d.classList.remove('active'));
        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentIndex = index;
      };

      const nextSlide = () => {
        const next = (currentIndex + 1) % slides.length;
        showSlide(next);
      };

      const startAutoScroll = () => {
        intervalId = setInterval(nextSlide, autoScrollDelay);
      };

      const stopAutoScroll = () => {
        if (intervalId) clearInterval(intervalId);
      };

      // Pause on hover
      carousel.addEventListener('mouseenter', stopAutoScroll);
      carousel.addEventListener('mouseleave', startAutoScroll);

      // Start auto-scroll
      startAutoScroll();
    };

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const carousel = entry.target;
            loadCarouselImages(carousel);
            initCarouselAutoScroll(carousel);
            observer.unobserve(carousel);
          }
        });
      }, {
        rootMargin: '200px 0px', // Load 200px before entering viewport
        threshold: 0
      });

      carousels.forEach((carousel) => observer.observe(carousel));
    } else {
      // Fallback for older browsers: load all immediately
      carousels.forEach((carousel) => {
        loadCarouselImages(carousel);
        initCarouselAutoScroll(carousel);
      });
    }
  };


  // One player, four cuts. The pills swap the iframe src so only the video the
  // visitor actually picks gets loaded.
  const initVideoPicker = () => {
    const section = document.getElementById('video');
    if (!section) return;

    const frame = section.querySelector('.video-embed iframe');
    const embed = section.querySelector('.video-embed');
    const title = section.querySelector('.video-caption h3');
    const description = section.querySelector('.video-caption p');
    const pills = section.querySelectorAll('.video-pill');
    if (!frame || !pills.length) return;

    const YT_ORIGIN = 'https://www.youtube-nocookie.com';

    // Talk to the embed over postMessage rather than pulling in YouTube's
    // ~40KB IFrame API - the player exposes this as long as the src carries
    // enablejsapi=1.
    const command = (func) => {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: func, args: [] }), YT_ORIGIN);
      }
    };

    // Handshake: without this the player never reports state back to us
    const listen = () => {
      if (frame.contentWindow) {
        frame.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), YT_ORIGIN);
      }
    };
    frame.addEventListener('load', listen);
    listen();

    let isPlaying = false;
    let pausedByScroll = false;

    window.addEventListener('message', (event) => {
      if (event.origin !== YT_ORIGIN) return;
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        return;
      }
      if (data && data.event === 'onStateChange') {
        isPlaying = Number(data.info) === 1;
        // Anything the visitor does by hand overrides our bookkeeping
        if (isPlaying) pausedByScroll = false;
      }
    });

    // Pause when the player scrolls away, resume when it comes back. We only
    // resume what we paused - starting playback unbidden would be rude, and
    // browsers block unmuted autoplay anyway.
    if (embed && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const visible = entry.intersectionRatio >= 0.5;
          if (!visible && isPlaying) {
            command('pauseVideo');
            pausedByScroll = true;
          } else if (visible && pausedByScroll) {
            command('playVideo');
            pausedByScroll = false;
          }
        });
      }, { threshold: [0, 0.5] });

      observer.observe(embed);
    }

    // Retranslate a single element in place. Deliberately not applyTranslations(),
    // which pushes a history entry - that would add one per click.
    const setText = (el, key) => {
      el.setAttribute('data-i18n', key);
      const lang = typeof getCurentLanguage === 'function' ? getCurentLanguage() : 'en';
      if (typeof translations !== 'undefined' && translations[lang] && key in translations[lang]) {
        el.textContent = translations[lang][key];
      }
    };

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const { videoId, videoKey } = pill.dataset;

        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        // The click is the user gesture that lets autoplay through
        frame.src = `${YT_ORIGIN}/embed/${videoId}?rel=0&enablejsapi=1&autoplay=1`;
        pausedByScroll = false;

        setText(title, `video.${videoKey}.title`);
        setText(description, `video.${videoKey}.description`);
        frame.title = title.textContent;
      });
    });
  };


  // The hero loop is fixed to the viewport, so it keeps decoding even once the
  // page has scrolled past it. Pause it while it is covered.
  const heroVideo = () => {
    const video = document.querySelector('.hero-video');
    const header = document.getElementById('header');
    if (!video || !header || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Autoplay can be refused (low power mode, reduced motion); the
          // poster stays in that case, so swallow the rejection.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0 });

    observer.observe(header);
  };


  $(() => {
    mobileMenuOutsideClick();
    offcanvasMenu();
    burgerMenu();
    contentWayPoint();
    goToTop();
    loaderPage();
    initTimelineCarousels();
    heroVideo();
    initVideoPicker();
  });

}());
