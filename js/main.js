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

  // Save to calendar
  const saveTheDate = () => {
    const inviteFile = "save-the-date.ics";
    $(".save-date-btn").attr({
      "href": inviteFile,
      "download": inviteFile,
    });

    // const dialog = document.getElementById("dialog-cal");
    // const openCalDialog = () => dialog.showModal();
    // $(".cal-btn").click(() => dialog.close());
    // $("#save-date-img").click(openCalDialog);
    // $("#save-date-btn").click(openCalDialog);
  };


  $(() => {
    mobileMenuOutsideClick();
    offcanvasMenu();
    burgerMenu();
    contentWayPoint();
    goToTop();
    loaderPage();
    saveTheDate();
  });

  // Parallax
  document.addEventListener('DOMContentLoaded', () => {
    $(window).stellar({
      horizontalScrolling: false,
      responsive: true,
    });
  });

}());
