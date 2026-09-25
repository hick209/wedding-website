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


  $(() => {
    mobileMenuOutsideClick();
    offcanvasMenu();
    burgerMenu();
    contentWayPoint();
    goToTop();
    loaderPage();
    initTimelineCarousels();
  });

  // Parallax
  document.addEventListener('DOMContentLoaded', () => {
    $(window).stellar({
      horizontalScrolling: false,
      responsive: true,
    });
  });

}());
