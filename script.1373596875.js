MADWELL2 = {
    animationSpeed: 'slow',
    isLoading: false,
    isAjaxified: false,
    isInit: false,

    exec: function(controller, action, data, callback) {
        action = (action === undefined) ? 'init' : action;

        if (controller !== '' && this[controller] && typeof this[controller][action] == 'function') {
            this[controller][action](data, callback);

            logMsg('MADWELL2.'+controller+'.'+action+'()');
        }
    },

    init: function() {
        var body = document.body,
            controller = body.getAttribute('data-controller'),
            action = body.getAttribute('data-action');

        MADWELL2.exec('common');
        MADWELL2.exec(controller);
        MADWELL2.exec(controller, action);
        MADWELL2.exec('common', 'ajaxify');
    }
};

MADWELL2.common = {
    init: function() {
        // set layout options
        $(window).bind('resize', function(){
            if ($(window).width() <= 1440) {
                $('body')
                    .addClass('s1440')
                    .data('width', 1440);
            } else {
                $('body')
                    .removeClass('s1440')
                    .data('width', '');
            }

            $(window).scroll();
        });
        $(window).resize();

        MADWELL2.isInit = true;
    }, // MADWELL.common.init()

    ajaxify: function() {
        if (!MADWELL2.isAjaxified) {

            MADWELL2.isAjaxified = true;
            $('body').madAjaxify({
                animationSpeed: MADWELL2.animationSpeed
            });
        }
    },

    entry: function(data, callback) {
        $('#loading-notice').fadeOut('fast');
        $('#loading').fadeOut(MADWELL2.animationSpeed, function(){
            $('#container').animate({opacity: 1}, MADWELL2.animationSpeed, function(){
                if (typeof callback == 'function') {
                    callback();
                }
            });
        });

        // update twitter feed
        // $.getJSON(
        // 	'http://api.twitter.com/1/statuses/user_timeline/madwellington.json?callback=?&count=1',
        // 	function(data){
        // 		MADWELL2.common.twitterCallback2(data);
        // 	}
        // );

    },

    exit: function(data, callback) {
        MADWELL2.isInit = false;

        $('#container').animate({opacity: 0}, MADWELL2.animationSpeed, function(){
            $('#loading').fadeIn(MADWELL2.animationSpeed);

            if (typeof callback === 'function') {
                callback();
            }
        });
    },

    showLoader: function() {
        if (!MADWELL2.isInit) return;

        var loader = $('#loading2'),
            a1 = 0,
            a2 = 0,
            a3 = 0;

        if (!Modernizr.cssanimations) {
            // spinning objects
            setInterval(function(){
                a1 += .35;
                a2 += .20;
                a3 += .55;
                $('#loading2-img1').rotate(a1);
                $('#loading2-img2').rotate(a2);
                $('#loading2-img3').rotate(a3);
            }, 30);

            // pulsating objects
            (function pulse(){
                var obj = $('#loading2-img4');

                obj.animate({ opacity: 0 }, 1500, function(){
                    obj.animate({ opacity: 1 }, 1500, function(){
                        pulse();
                    });
                });
            })();
        }

        $('#header, #container').hide();
        loader.show();
    },

    hideLoader: function() {
        var loader = $('#loading2');
        loader.fadeOut(MADWELL2.animationSpeed, function(){
            $(this).remove();
            $('#header, #container').show();
            $(window).scroll();
        });
    },

    twitterCallback2: function(tweets) {
        var statusHTML = [];
        for (var i=0; i<tweets.length; i++){
            var username = tweets[i].user.screen_name;
            var status = tweets[i].text.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, function(url) {
                return '<a href="'+url+'">'+url+'</a>';
            }).replace(/\B@([_a-z0-9]+)/ig, function(reply) {
                return  reply.charAt(0)+'<a href="http://twitter.com/'+reply.substring(1)+'">'+reply.substring(1)+'</a>';
            });
            statusHTML.push('<li><span>'+status+'</span> <a style="font-size:85%" href="http://twitter.com/'+username+'/statuses/'+tweets[i].id_str+'">'+MADWELL2.common.relative_time(tweets[i].created_at)+'</a></li>');
        }
        document.getElementById('twitter_update_list').innerHTML = statusHTML.join('');
    },

    relative_time: function (time_value) {
        var values = time_value.split(" ");
        time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
        var parsed_date = Date.parse(time_value);
        var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
        var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
        delta = delta + (relative_to.getTimezoneOffset() * 60);

        if (delta < 60) {
            return 'less than a minute ago';
        } else if(delta < 120) {
            return 'about a minute ago';
        } else if(delta < (60*60)) {
            return (parseInt(delta / 60)).toString() + ' minutes ago';
        } else if(delta < (120*60)) {
            return 'about an hour ago';
        } else if(delta < (24*60*60)) {
            return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
        } else if(delta < (48*60*60)) {
            return '1 day ago';
        } else {
            return (parseInt(delta / 86400)).toString() + ' days ago';
        }
    }

};

MADWELL2.work = {
    init: function(data, callback) {
        if (isIpad()) {
//			$.cookie('layout', 'grid');
            $('body').addClass('ipad layout-grid');
        }

        if (isIphone()) {
//			$.cookie('layout', 'single');
//			$('body').addClass('iphone layout-single');
            $('body').addClass('iphone layout-grid layout-grid-1col');
        }

        if (typeof callback == 'function') {
            callback();
        }
    },

    _switchStyle: function(layout) {
        var switcher = $('#switcher');

        switch (layout) {
            case 'grid':
                $('#container').clearQueue().animate({opacity: 0}, 'fast', function(){
                    switcher.addClass('is-grid').attr('title', 'Switch to Parallax View');
                    $('body').addClass('layout-grid');

                    $('.parallax-section')
                        .addClass('is-covered')
                        .css({backgroundPosition: '', opacity: 0})
                        .find('.parallax-banner')
                        .css({position: 'absolute'});

                    $('.parallax-section').each(function() {
                        var gridPs = $(this),
                            gridBg = $(this).css('backgroundImage').replace(/"/g, '').replace(/url\(|\)$/ig, '');

                        $.imgpreload(gridBg, function(){
                            gridPs.removeClass('is-covered');
                        });
                    });

                    $('.parallax-head').each(function(){
                        $(this).html($(this).data('shortName'));
                    });

                    // preload body background images
                    var bodyOverlay = $('#overlay').show(),
                        bodyBgs = [];

                    $.each($(document.body).css('background-image').split(', '), function(i, v) {
                        if ('none' != v) {
                            bodyBgs.push(v.replace(/"/g, '').replace(/url\(|\)$/ig, ''));
                        }
                    });

                    $.imgpreload(bodyBgs, {
                        each: function(){
                            $(window).scroll();
                        },
                        all: function(){
                            $('.parallax-section').css({opacity: 1});
                            $('#container').animate({opacity: 1}, MADWELL2.animationSpeed, function(){
                                bodyOverlay.fadeOut(MADWELL2.animationSpeed);
                            });
                        }
                    });

                    if (!isIpad() && !isIphone()) {
                        $.cookie('layout', 'grid');
                    }
                });

                break;

            default:
                $('#container').clearQueue().animate({opacity: 0}, 'fast', function(){
                    switcher.removeClass('is-grid').attr('title', 'Switch to Grid View');

                    $('body')
                        .removeClass('layout-grid')
                        .css({backgroundPosition: ''});

                    // switch headings
                    $('.parallax-head').each(function(){
                        $(this).html($(this).data('longName'));
                    });

                    if (!isIpad() && !isIphone()) {
                        $.cookie('layout', 'default');
                    }

                    $('#container').animate({opacity: 1}, MADWELL2.animationSpeed);
                    $(window).scroll();
                });

        } // switch()

        $(window).scroll();
    },

    index: function(data, callback) {

        // preload images
        var homeImages = [
                '//cdn.madwellnyc.com/loading3/loading3a.png',
                '//cdn.madwellnyc.com/loading3/404.jpg',
//				'//cdn.madwellnyc.com/loading3/center.png',
                '//cdn.madwellnyc.com/loading3/disk.png',
                '//cdn.madwellnyc.com/loading3/madwellball.png',
                '//cdn.madwellnyc.com/loading3/madwellball2.png'
            ],
            loadedImages = 0,
            loadedPercent = 0;

        // hide all sections first and show loader
        $('#container').css('opacity', 0);
//		$('#loading-notice').not(':visible').show();
//		$('body').css('overflow', 'hidden');
        MADWELL2.isLoading = true;
        MADWELL2.common.showLoader();

        $('.parallax-section').each(function() {
            // preload background images
            $.each($(this).css('background-image').split(', '), function(i, v) {
                if ('none' != v) {
                    homeImages.push(v.replace(/"/g, '').replace(/url\(|\)$/ig, ''));
                }
            });

            // simulate clicking the more link
            $(this).bind('click', function(event){
                if (isIpad() && !$(this).hasClass('is-hovered')) {
                    $(this)
                        .addClass('is-hovered')
                        .siblings()
                        .removeClass('is-hovered');
                    return false;
                }

                $(this).find('.parallax-more').click();
            });

        });

        $.imgpreload(homeImages, {
            each: function() {
                if ($(this).data('loaded')) {
                    loadedImages++;
                    loadedPercent = Math.ceil(loadedImages / homeImages.length * 100);
                    $('#loading-notice').text(loadedPercent + '% Loaded');
                    $('#loading2-counter .digits').text(loadedPercent);
                    $('#loading2-counter').removeClass().addClass('loading2-counter-'+loadedPercent);
                    logMsg($(this).attr('src'));
                }
            },
            all: function() {
                $('#loading, #loading-notice').fadeOut(MADWELL2.animationSpeed);
                MADWELL2.common.hideLoader();

                // keep hidden on iPad
                var iPadExcludes = [];

                $('.parallax-section').each(function() {
                    if ($('body').hasClass('ipad') && $.inArray($(this).attr('id'), iPadExcludes) != -1) {
                        // do something else for iPad's
                    } else {
                        if ($(this).is(':in-viewport')) {
                            $(this).animate({opacity: 1}, MADWELL2.animationSpeed);
                        }
                    }
                })

                $('#container').animate({opacity: 1}, MADWELL2.animationSpeed);

                function calcBgPos(w, h, x, y, start, adjuster, inertia) {
                    var bgPos = ((($(window).width() - w) / 2) + x) + 'px ' +
                        ((-((start - adjuster)) * inertia) + y)  + 'px';

                    return bgPos;
                }

                // style switcher; more like a toggle for now
                $('#switcher')
                    .bind('click', function(event){
                        if ($.cookie('layout') == 'grid') {
                            MADWELL2.exec('work', '_switchStyle', 'default');
                        } else {
                            MADWELL2.exec('work', '_switchStyle', 'grid');
                        }

                        event.preventDefault();
                    })
                    .css({display: isIpad() || isIphone() ? 'none' : 'block'});

                // handle scrolling
                $(window).bind('scroll', function() {

                    var winH = $(window).height(),
                        scrT = $(window).scrollTop();

                    // grid layout parallax effect
                    if ($('body').hasClass('layout-grid')) {
                        $('body').css({
                            backgroundPosition:
                            calcBgPos(1750, 1205, -50, -50, scrT, 1269, 0.18) + ", " +
                            calcBgPos(1750, 1205, -50, -50, scrT, 1135, 0.12) + ", " +
                            calcBgPos(1750, 1205, -50, -50, scrT, 1200, 0.10) + ", " +
                            calcBgPos(1750, 1205, -50, -50, scrT, 1000, 0.08) + ", " +
                            calcBgPos(1750, 1205, -50, -50, scrT, 1178, 0.14) + ", " +
                            calcBgPos(1750, 1205, -50, -50, scrT, 1078, 0.04)
                        });

                        return;
                    }


                    $('.parallax-section:not(:in-viewport)')
                        .css('opacity', 0)
                        .find('.parallax-banner')
                        .css('position', 'static');

                    $('.parallax-section:in-viewport').each(function(){
                        var thisId = $(this).attr('id'),
                            thisTop = $(this).offset().top,
                            thisBanner = $(this).find('.parallax-banner');

                        // show what's in the viewport
                        $(this).css('opacity', 1);

                        // make the banner stick at the top
                        if (scrT+104 > thisTop) {
                            thisBanner.css('position', 'fixed');
                        } else {
                            thisBanner.css('position', 'static');
                        }

                        var theTop = winH + scrT,
                            layout = $('body').data('width');

                        // parallax effect for "#intro" section
                        if (thisId == 'intro') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos( 980, 792, 580, 441, theTop, 2478, 0.00) + ", " +
                                    calcBgPos(1224, 792,  34, 315, theTop, 1878, 0.07) + ", " +
                                    calcBgPos( 980, 792, 439,  47, theTop, 1669, 0.18) + ", " +
                                    calcBgPos( 980, 792, 519,   0, theTop, 1335, 0.12) + ", " +
                                    calcBgPos( 980, 792, 535,   0, theTop, 1600, 0.10) + ", " +
                                    calcBgPos( 980, 792, 583,   0, theTop, 1400, 0.08) + ", " +
                                    calcBgPos( 980, 792, 472,   0, theTop, 1778, 0.14) + ", " +
                                    calcBgPos( 980, 792, 655,   0, theTop, 1078, 0.04)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos( 980, 992, 580, 641, theTop, 2478, 0.00) + ", " +
                                    calcBgPos(1224, 992,  34, 514, theTop, 1878, 0.07) + ", " +
                                    calcBgPos( 980, 992, 439, 246, theTop, 1669, 0.18) + ", " +
                                    calcBgPos( 980, 992, 519, 129, theTop, 1335, 0.12) + ", " +
                                    calcBgPos( 980, 992, 526, 179, theTop, 1600, 0.10) + ", " +
                                    calcBgPos( 980, 992, 582,  82, theTop, 1400, 0.08) + ", " +
                                    calcBgPos( 980, 992, 472, 176, theTop, 1778, 0.14) + ", " +
                                    calcBgPos( 980, 992, 634,  81, theTop, 1078, 0.04)
                                });
                            }
                        }

                        // parallax effect for "#spro" section
                        if (thisId == 'spro') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440,  933, 582, 202, theTop, 4400, 0.05) + ", " +
                                    calcBgPos(1440, 1080,  52,   0, theTop, 2300, 0.20) + ", " +
                                    calcBgPos(1440,  955, 403, 311, theTop, 4560, 0.10) + ", " +
                                    calcBgPos(1440,  989, 450, 185, theTop, 4900, 0.01) + ", " +
                                    calcBgPos(1440,  925, 653, 301, theTop, 4430, 0.01) + ", " +
                                    calcBgPos(1440,  938, 119, 106, theTop, 4700, 0.03)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2650, 1000, 1132, 183, theTop, 4400, 0.05) + ", " +
                                    calcBgPos(2650, 1500,  390,   0, theTop, 2300, 0.20) + ", " +
                                    calcBgPos(2650, 1200,  881, 304, theTop, 4560, 0.10) + ", " +
                                    calcBgPos(2650, 1000,  949,  83, theTop, 4900, 0.01) + ", " +
                                    calcBgPos(2650, 1000, 1231, 330, theTop, 4430, 0.01) + ", " +
                                    calcBgPos(2650, 1000,  488,  43, theTop, 4700, 0.03)
                                });
                            }
                        }

                        // parallax effect for "#vitacoco" section
                        if (thisId == 'vitacoco') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 952, 0, 151, theTop, 4170, 0.40) + ", " +
                                    calcBgPos(1440, 715, 0, 117, theTop, 4660, 0.25) + ", " +
                                    calcBgPos(1440, 952, 0,   0, theTop, 4520, 0.15)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2560, 1457, 0, 345, theTop, 3565, 0.40) + ", " +
                                    calcBgPos(2560,  966, 0, 267, theTop, 4660, 0.25) + ", " +
                                    calcBgPos(2700,  735, 0,   0, theTop, 4520, 0.15)
                                });
                            }
                        }

                        // parallax effect for "#kind" section
                        if (thisId == 'kind') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 1080, 446, 144, theTop, 1700, -0.02) + ", " +
                                    calcBgPos(1440, 1080,   0, 641, theTop, 6000,  0.25) + ", " +
                                    calcBgPos(1440, 1080, 538, 486, theTop, 6420,  0.10) + ", " +
                                    calcBgPos(1440, 1080,   0,   0, theTop, 6200,  0.05)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2560, 1500,  900, 200, theTop, 1700, -0.02) + ", " +
                                    calcBgPos(2560, 1500,    0, 811, theTop, 6000,  0.25) + ", " +
                                    calcBgPos(2560, 1500, 1002, 651, theTop, 6420,  0.10) + ", " +
                                    calcBgPos(2560, 1500,    0,   0, theTop, 6200,  0.05)
                                });
                            }
                        }

                        // parallax effect for "#foodies" section
                        if (thisId == 'foodies') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 1080, 0,   0, theTop, 7000, 0.25) + ", " +
                                    calcBgPos(1440, 1080, 807, 0, theTop, 7300, 0.20) + ", " +
                                    calcBgPos(1440, 1080, 0,   0, theTop, 7520, 0.15) + ", " +
                                    calcBgPos(1440, 1080, 0,   0, theTop, 7220, 0.10)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2560, 1500, 0,    0, theTop, 7000, 0.25) + ", " +
                                    calcBgPos(2560, 1500, 0,    0, theTop, 7300, 0.20) + ", " +
                                    calcBgPos(2560, 1500, 0,    0, theTop, 7520, 0.15) + ", " +
                                    calcBgPos(2560, 1500, 0,    0, theTop, 7220, 0.10)
                                });
                            }
                        }

                        // parallax effect for "#burtsbees" section
                        if (thisId == 'burtsbees') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 792,   0, 177, theTop, 10700, 0.20) + ", " +
                                    calcBgPos(1440, 907, 368, 281, theTop,  9560, 0.10) + ", " +
                                    calcBgPos(1440, 792, 557,   0, theTop,  7500, 0.05) + ", " +
                                    calcBgPos(1440, 792, 455, 408, theTop,  9520, 0.15) + ", " +
                                    calcBgPos(1440, 792, 715, 344, theTop, 12200, 0.05) + ", " +
                                    calcBgPos(1440, 907,   0,   0, theTop,  9510, 0.10)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2560, 1100,    0, 244, theTop, 10700, 0.20) + ", " +
                                    calcBgPos(2560, 1260,  789, 391, theTop,  9560, 0.10) + ", " +
                                    calcBgPos(2560, 1100, 1053,   0, theTop,  7500, 0.05) + ", " +
                                    calcBgPos(2560, 1100,  911, 566, theTop,  9520, 0.15) + ", " +
                                    calcBgPos(2560, 1100, 1272, 475, theTop, 12200, 0.05) + ", " +
                                    calcBgPos(2560, 1260,    0,   0, theTop,  9560, 0.10)
                                });
                            }
                        }

                        // parallax effect for "#gsm" section
                        if (thisId == 'gsm') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 1080, 0, 165, theTop, 10200, 0.20) + ", " +
                                    calcBgPos(1440, 1080, 0, 240, theTop, 11700, 0.10) + ", " +
                                    calcBgPos(1440, 1080, 0,   0, theTop, 12400, 0.05)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2560, 1500, 0, 0, theTop, 10200, 0.20) + ", " +
                                    calcBgPos(2560, 1500, 0, 0, theTop, 11700, 0.10) + ", " +
                                    calcBgPos(2560, 1500, 0, 0, theTop, 12400, 0.05)
                                });
                            }
                        }

                        // parallax effect for "#dbd" section
                        if (thisId == 'dbd') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 1080, 216,   0, theTop, 11800, 0.35) + ", " +
                                    calcBgPos(2560, 1500, 225, 244, theTop, 12200, 0.20) + ", " +
                                    calcBgPos(2560, 1184, 243, 206, theTop, 12280, 0.08) + ", " +
                                    calcBgPos(1440,  991, 143, 370, theTop, 11600, 0.05)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2560, 1500, 216,   0, theTop, 11800, 0.35) + ", " +
                                    calcBgPos(2560, 1500, 225, 244, theTop, 12200, 0.20) + ", " +
                                    calcBgPos(2560, 1500, 243, 522, theTop, 12280, 0.08) + ", " +
                                    calcBgPos(2560, 1500, 468, 624, theTop, 11600, 0.05)
                                });
                            }
                        }

                        // parallax effect for "#remains" section
                        if (thisId == 'remains') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 1080, 38, 448, theTop, 12700, 0.05) + ", " +
                                    calcBgPos(1440,  595,  0,   0, theTop, 13000, 0.28) + ", " +
                                    calcBgPos(1440, 1080,  0,   0, theTop, 12600, 0.10)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2560, 1500, 379, 623, theTop, 12700, 0.05) + ", " +
                                    calcBgPos(2560, 1500, 267, 150, theTop, 13000, 0.28) + ", " +
                                    calcBgPos(2560, 1500,   0,   0, theTop, 12600, 0.10)
                                });
                            }
                        }

                        // parallax effect for "#penny" section
                        if (thisId == 'penny') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1440, 881,   0,   0, theTop, 13950,  0.20) + ", " +
                                    calcBgPos(1440, 881, 432, 339, theTop, 15550,  0.30) + ", " +
                                    calcBgPos(1440, 881, 779, 144, theTop, 16600, -0.05) + ", " +
                                    calcBgPos(1440, 881,   0,   0, theTop, 15420,  0.10)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(2650, 1224,  275,   0, theTop, 13950,  0.20) + ", " +
                                    calcBgPos(2650, 1224,  924, 472, theTop, 15550,  0.30) + ", " +
                                    calcBgPos(2650, 1000, 1407,   0, theTop, 16600, -0.05) + ", " +
                                    calcBgPos(2650, 1224,    0,   0, theTop, 15420,  0.10)
                                });
                            }
                        }

                        // parallax effect for "#tia" section
                        if (thisId == 'tia') {
                            if (layout == '1440') {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos( 856,  346,   0,   0, theTop, 14800,  0.10) + ", " +
                                    calcBgPos(1440, 1080, 305,   0, theTop, 17300, -0.25) + ", " +
                                    calcBgPos(1440, 1080, 663, 507, theTop, 15800,  0.15) + ", " +
                                    calcBgPos(1440, 1080,   0,   0, theTop, 14800,  0.10)
                                });
                            } else {
                                $(this).css({
                                    backgroundPosition:
                                    calcBgPos(1189,  480,    0,   0, theTop, 14800,  0.10) + ", " +
                                    calcBgPos(2650, 1500,  748,   0, theTop, 17300, -0.25) + ", " +
                                    calcBgPos(2650, 1500, 1247, 705, theTop, 15800,  0.15) + ", " +
                                    calcBgPos(2650, 1500,    0,   0, theTop, 14800,  0.10)
                                });
                            }
                        }

                        // parallax effect for "#hop" section
                        if (thisId == 'hop') {
                            $(this).css({
                                backgroundPosition:
                                calcBgPos(2650, 1500, 667, 123, theTop, 17700, -0.30) + ", " +
                                calcBgPos(2650, 1500, 667, 156, theTop, 17700, -0.15) + ", " +
                                calcBgPos(2650, 1500, 667, 190, theTop, 15700,  0.00) + ", " +
                                calcBgPos(2650, 1500, 667, 224, theTop, 17700,  0.15) + ", " +
                                calcBgPos(2650, 1500, 667, 257, theTop, 17700,  0.30) + ", " +
                                calcBgPos(2650, 1785,   0,   0, theTop, 15200,  0.05)
                            });
                        }

                    });
                }); // window.scroll()

                $(window).scroll();
            } // :all()
        }); // $.imgpreload()

        // the cookie here should have been set by the common.init() already
        // or by the work._swithcStyle()
        if (isIpad()) {
            MADWELL2.exec('work', '_switchStyle', 'grid');
        } else {
            MADWELL2.exec('work', '_switchStyle', $.cookie('layout'));
        }
    },

    // custom entry animation
    _projectPage: function(data, callback) {
        // hide parts for entry animations
        $('#container>*').css('opacity', 0);
        $('.work-banner').addClass('is-collapsed');
        $('#container').css('opacity', 1);

        // append captions
        $('.work-slideshow-slides img').each(function(){
            var title = $(this).attr('title');

            if (title) {
                $('<span/>')
                    .addClass('work-slideshow-caption')
                    .text(title)
                    .insertAfter($(this));
            }
        });

        // initialize slideshow
        $('.work-slideshow-slides').cycle({
            fx: 'scrollHorz',
            speed: 'normal',
            easing: 'easeInOutQuint',
            speed: 500,
            timeout: 0,
            prev: '.work-slideshow-prev',
            next: '.work-slideshow-next',
            pager: '.work-slideshow-pager'
        });

        // entry animation
        $('#loading-notice').fadeOut('fast');
        $('#loading').fadeOut(MADWELL2.animationSpeed, function(){
            $('.work-banner').css('opacity', 1).removeClass('is-collapsed');
            $('#container>*:not(.work-banner)').animate({opacity: 1}, MADWELL2.animationSpeed, function(){
                if (typeof callback == 'function') {
                    callback();
                }
            });
        });

        // update twitter feed
        $.getJSON(
            'http://api.twitter.com/1/statuses/user_timeline/madwellington.json?callback=?&count=1',
            function(data){
                MADWELL2.common.twitterCallback2(data);
            }
        );
    },

    spro: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    vitacoco: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    kind: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    foodies: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    burtsbees: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    gsm: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    dbd: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    remains: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    penny: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    tia: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    hop: function(data, callback) {
        MADWELL2.exec('work', '_projectPage', data, callback);
    },

    exit: function(data, callback) {
        if ($('body').data('action') != 'index') {
            var exitAnim = function() {
                return $('#container>*:not(.work-banner)').animate({opacity: 0}, MADWELL2.animationSpeed);
            }

            $.when(exitAnim()).done(function() {
                $('.work-banner').addClass('is-collapsed');
                $('#loading').fadeIn(MADWELL2.animationSpeed, function(){
                    $('#container').css('opacity', 0);
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            });
        } else { // we'll assume that we're exiting the work-index page
            $('body').css({
                backgroundPosition: ''
            });
            $('#switcher').hide().unbind('click');
            MADWELL2.exec('common', 'exit', data, callback);
        }
    }
};

MADWELL2.brief = {

    init: function() {
    },

    index: function(data, callback) {
        MADWELL2.exec('common', 'entry');

        var isProcessSwitching = false;

        $('.processswitch').click(function(event){
            event.preventDefault();

            if (isProcessSwitching) return; // ignore this click if the previous one is still running

            isProcessSwitching = true;

            // no need to animate here because the CSS does it already
            $(this)
                .addClass('current')
                .siblings('.processswitch')
                .removeClass('current');

            // hide .processsingle.current
            $('.processsingle.current')
                .removeClass('current')
                .animate({ opacity: 0, zIndex: 0 }, 700);

            // show clicked .processsingle
            $($(this).attr('href'))
                .addClass('current')
                .animate({ opacity: 1, zIndex: 1 }, 900, function(){
                    isProcessSwitching = false; // the final animateion; turn on switching
                });
        });

        $('#services a').click(function(event){
            event.preventDefault();

            $(this)
                .addClass('current')
                .siblings('a')
                .removeClass('current');

            $($(this).attr('href'))
                .addClass('current')
                .siblings('div')
                .removeClass('current');
        });

        if (typeof callback == 'function') {
            callback();
        }
    },

    exit: function(data, callback) {
        MADWELL2.exec('common', 'exit', data, callback);
    }
};


MADWELL2.team = {
    init: function() {
    },

    index: function() {
        MADWELL2.exec('common', 'entry');

        $('#team-list li').bind('mouseenter', function(){
            $(this)
                .addClass('is-ontop')
                .siblings()
                .removeClass('is-ontop');
        });

        if (isIpad() || isIphone()) {
            $('#team-list li').bind('click', function(){
                $(this)
                    .addClass('is-hovered')
                    .siblings()
                    .removeClass('is-hovered');
            });
        }
    },

    exit: function(data, callback) {
        MADWELL2.exec('common', 'exit', data, callback);
    }
};

MADWELL2.contact = {
    init: function() {
    },

    index: function() {

        var isFormDirty = false;

        $('#contact-form').on({
            mouseenter: function(){
                $(this).removeClass('is-collapsed');
            },
            mouseleave: function(){
                if (!isFormDirty) {
                    $(this).addClass('is-collapsed');
                }
            }
        });

        $('#contact-form input[type=text], #contact-form textarea').on({
            focus: function(){
                isFormDirty = true;
            },
            blur: function(){
            },
            keypress: function(){
                isFormDirty = true;
                $(this).css('background', '#fff');
            }
        });

        $('#contact-form').validate();

        MADWELL2.exec('common', 'entry');
    },

    exit: function(data, callback) {
        MADWELL2.exec('common', 'exit', data, callback)
    }
};

MADWELL2.e404 = {
    init: function() {
    },

    index: function() {
        MADWELL2.exec('common', 'entry');
    },

    exit: function(data, callback) {
        MADWELL2.exec('common', 'exit', data, callback);
    }
};

$(document).ready(MADWELL2.init);