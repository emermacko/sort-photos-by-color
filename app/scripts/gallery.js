import $ from "./jquery.min.js";

var lastScrollTop = 0;
var previewScrollTop;
var ignoreScroll = false;

const clientID = '084e31407b21fa0';

var photo;
var index;   // index of the clicked photo

function initiateLazy() {
  $('.lazy').Lazy({
    effect: 'fadeIn',
    effectTime: 500,
    threshold: 400,

    afterLoad: function(element) {
      element.removeClass("lazy");
      $(element).data("plugin_lazy").destroy();
    }
  });
}

window.addEventListener('load', async function() {
    $("#content").delay(500).animate({ opacity: 1 });
    const album = await getImages()
    changeAlbum(album);
});

/* Resizing window actions */
$(window).resize(function(){
  if(isDesktop()){
    $('#menu').css('top', '0');
  }
});

/* console art */
function ascii() {
  console.clear();
  console.log("\n\n\n");
  console.log("   _,--._.-,");
  console.log("  / \\_r-,\\_ )");
  console.log(".-.) _;='_/  (.;");
  console.log(" \\ \\'      \\/S )");
  console.log("  L.'-. _.'|- '");
  console.log(" <_`-'\\'_.' /");
  console.log("   `'-._( \\");
  console.log("    ___   \\\\,      ___");
  console.log("    \\ .'-. \\\\   .-'_. /");
  console.log("     '._' '.\\\\/.-'_.'");
  console.log("        '--``\\('--'");
  console.log("              \\\\");
  console.log("              `\\\\,");
  console.log("                \\|");
  console.log("\n\n\n");
}

/* checking if website is displayed on mobile or desktop */
function isDesktop() {
  return ($(window).width() > 775);
}

/* disable right click */
$(function(){
  $('body').on('contextmenu', '*', function(e){
    return false;
  });
})

/* hide & show menu on scroll in mobile view */
$(window).scroll(function() {
  if(!isDesktop()) {

    var ignore = ignoreScroll;
    ignoreScroll = false;

    if(!ignore) {
      var scrollTop = $(this).scrollTop();
      if(Math.abs(scrollTop - lastScrollTop) > 70) {
        if(scrollTop > lastScrollTop) {
          $('#menu').delay(200).css('top', '-130');
        } else {
          $('#menu').css('top', '0');
        }
        lastScrollTop = scrollTop;
      }
    }
  }
});
