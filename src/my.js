let savedTheme = localStorage.getItem('theme');

if (savedTheme == 'D') {
    $('.ui').toggleClass('inverted');
    $('body').toggleClass('inverted');
}

$('#turnLight').on('click', function () {
    if ($('.moon.icon').length != 0) $('.moon.icon').addClass('sun').removeClass('moon');
    else $('.sun.icon').addClass('moon').removeClass('sun');
    $('.ui').toggleClass('inverted');
    savedTheme = (savedTheme == 'D') ? 'L' : 'D';
    localStorage.setItem('theme', savedTheme);
});

$('#copy-content').on('click', function () {
    let $this = $(this);
    navigator.clipboard.writeText($this.text()).then(() => {
        $this.addClass('blue');
        setTimeout(() => { $this.removeClass('blue'); }, 100);
    });
});