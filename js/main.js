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


  // The hero's scroll cue: smooth-scrolls like the rest of the page, and gets
  // out of the way the moment the visitor starts scrolling on their own.
  const heroScrollCue = () => {
    const $cue = $('.js-hero-scroll');
    const $target = $('#thanks');
    if (!$cue.length) return;

    $cue.on('click', (event) => {
      if (!$target.length) return;
      event.preventDefault();
      $('html, body').animate({ scrollTop: $target.offset().top }, 700, 'easeInOutExpo');
    });

    const toggleCue = () => $cue.toggleClass('is-hidden', $(window).scrollTop() > 80);
    $(window).scroll(toggleCue);
    toggleCue();
  };


  // One player, four cuts. The pills swap the video, so only the cut the
  // visitor actually picks is ever loaded.
  //
  // Scroll pause/resume has to know whether the player is playing. The bare
  // postMessage protocol would not tell us - the undocumented
  // {"event":"listening"} handshake went unanswered, so the state never
  // arrived and nothing ever fired. This uses YouTube's supported IFrame
  // Player API instead, attached to the iframe already in the markup (so the
  // player still works with JS off) and fetched only once the section is
  // nearly in view.
  const initVideoPicker = () => {
    const section = document.getElementById('video');
    if (!section) return;

    const frame = document.getElementById('video-player');
    const embed = section.querySelector('.video-embed');
    const title = section.querySelector('.video-caption h3');
    const description = section.querySelector('.video-caption p');
    const pills = section.querySelectorAll('.video-pill');
    if (!frame || !pills.length) return;

    const YT_HOST = 'https://www.youtube-nocookie.com';

    let player = null;
    let isPlaying = false;
    let pausedByScroll = false;

    // Retranslate a single element in place. Deliberately not
    // applyTranslations(), which pushes a history entry - that would add one
    // per click.
    const setText = (el, key) => {
      el.setAttribute('data-i18n', key);
      const lang = typeof getCurentLanguage === 'function' ? getCurentLanguage() : 'en';
      if (typeof translations !== 'undefined' && translations[lang] && key in translations[lang]) {
        el.textContent = translations[lang][key];
      }
    };

    const createPlayer = () => {
      if (player || !window.YT || !window.YT.Player) return;

      player = new window.YT.Player('video-player', {
        host: YT_HOST,
        events: {
          onStateChange: (event) => {
            isPlaying = event.data === window.YT.PlayerState.PLAYING;
            // Playing again by hand overrides our bookkeeping
            if (isPlaying) pausedByScroll = false;
          },
        },
      });
    };

    const loadApi = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
        return;
      }
      if (document.getElementById('youtube-iframe-api')) return;

      // The API calls this global as soon as it is ready, so define it before
      // the script has any chance to load
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === 'function') previous();
        createPlayer();
      };

      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    };

    // Only fetch the API for visitors who actually make it near the videos
    if ('IntersectionObserver' in window) {
      const apiObserver = new IntersectionObserver((entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadApi();
          obs.disconnect();
        }
      }, { rootMargin: '400px 0px' });

      apiObserver.observe(section);
    } else {
      loadApi();
    }

    // Pause when the player scrolls away, resume when it comes back. We only
    // resume what we paused - starting playback unbidden would be rude, and
    // browsers block unmuted autoplay anyway.
    if (embed && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!player || typeof player.pauseVideo !== 'function') return;

          const visible = entry.intersectionRatio >= 0.5;
          if (!visible && isPlaying) {
            player.pauseVideo();
            pausedByScroll = true;
          } else if (visible && pausedByScroll) {
            player.playVideo();
            pausedByScroll = false;
          }
        });
      }, { threshold: [0, 0.5] });

      observer.observe(embed);
    }

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const { videoId, videoKey } = pill.dataset;

        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        pausedByScroll = false;

        // The click is the user gesture that lets autoplay through
        if (player && typeof player.loadVideoById === 'function') {
          player.loadVideoById(videoId);
        } else {
          // API has not landed yet - swap the src, which autoplays on its own
          frame.src = `${YT_HOST}/embed/${videoId}?rel=0&enablejsapi=1&autoplay=1`;
        }

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
    heroScrollCue();
    initVideoPicker();
  });

}());
