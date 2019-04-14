function initScrolling() {
	var sections = ['classes','teachers','students','structure','result'];
	sections.forEach(function(v) {
		// https://www.w3schools.com/howto/howto_css_smooth_scroll.asp#section1
		$('#'+v+'-button').on('click',function(evt) {
			evt.preventDefault();
			$('.active').removeClass('active');
			$('#'+v+'-button').parent().addClass('active');
			$('html, body').animate({
				scrollTop: $('#'+v+'-section').offset().top
			},800);
		});
	});
	$('#title').on('click',function(evt) {
		$('html, body').animate({
			scrollTop: $('html').offset().top
		},800);
	});
}
