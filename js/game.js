/* Author: K.Adam White & Will Blair
 */

hangover = {
    isPouring: false,
    currentIngredient: null,
    patrons: (function() {
        var patronArray = [];
        var addPatron = function(patron) {
            patronArray.push(patron);
        };
        var currentPatron = function() {
            // Active patron will always be the first
            return patronArray[0];
        };
        var nextPatron = function() {
            patronArray.shift();
            return patronArray[0];
        };
        return {
            current: currentPatron,
            add: addPatron,
            next: nextPatron
        }
    })(),
    isPourGood: function(quantity){
        return true;
        //return (Math.abs(quantity) < .5);
    },
    counter: 0
};

/* Setup */
$('#ingredients').attr('style', function() {
    var numBottles = $(this).find('li').length,
        width = numBottles * 50;
    return 'width: ' + parseInt(width, 10) + 'px';
});
var urlVars = (function() {
    var map = {},
        pattern = "[?&]+([^=&#]+)=([^&#]*)",
        regex = new RegExp(pattern, "gi"),
        parts = window.location.href.replace(regex, function(m, key, value) {
            map[key] = value;
        });
    return map;
})();

if( urlVars["debug"] === "true" ) {
    hangover.debugMode = true;
    $('body').addClass('debug');
} else {
    hangover.debugMode = false;
}


/**
 * Define the pour itself
 */
hangover.pour = (function() {
    var pourCounts = [],
        startTime = null,
        endTime = null;
    /**
     * Return the total length of time for this pour instance
     * @param {Boolean} returnAsOunces Whether to return the duration as milliseconds (when false, default) or as ounces (when true)
     */
    var duration = function(returnAsOunces) {
        var totalDuration = 0;
        for( var i = 0, max = pourCounts.length; i < max; i++ ) {
            totalDuration = totalDuration + pourCounts[i];
        }
        if( returnAsOunces ) {
            // milliseconds / 1000 = seconds / 1.5 = oz
            totalDuration = totalDuration / 1500;
            return +totalDuration.toFixed(2);
        } else {
            return totalDuration;
        }
    };
    /**
     * Initialize the pour: Specify the liquor used, and enable the bottle view
     */
    var initializePour = function(name) {
        hangover.currentIngredient = name;
        // TODO: Check the active recipe to see if this ingredient is even relevant
        showBottle(name);
    };
    /**
     * Set the start time for a component of this pour
     */
    var startPour = function() {
        hangover.isPouring = true;
        $('#pour-screen').addClass('pouring');
        if( hangover.debugMode ) {
            $('#debug #pouring').html('POURING');
        }
        startTime = new Date();
        // If we're counting down to the end() of the pour, clear the timeout
        if( typeof hangover.pour.timeout === 'number' ) {
            window.clearTimeout(hangover.pour.timeout);
            delete hangover.pour.timeout;
        }
    };
    /**
     * Set the end time for a component of this pour, and log the duration
     */
    var stopPour = function() {
        hangover.isPouring = false;
        $('#pour-screen').removeClass('pouring');
        $('#debug #pouring').html('');
        endTime = new Date();
        // Log the total length of the pour to the pourCounts array
        pourCounts.push(endTime - startTime);
        // Reset Start and End times
        startTime = null;
        endTime = null;
    };
    /**
     * Conclude this pour, and announce the final duration
     */
    var endPour = function() {
        if( pourCounts.length === 0 ) {
            return;
        }
        // Announce that the pour is complete
        if( hangover.debugMode ) {
            $('#debug #log').append([
                '<li>',
                duration(false),
                'ms (',
                duration(true),
                ' oz)</li>'
            ].join(''));
        }
        hangover.patrons.current().drink.add(hangover.currentIngredient,duration(true))
        // Remove timeout variable
        delete hangover.pour.timeout;
        // Reset pourCounts
        pourCounts.length = 0;
        // Hide bottle TODO: Does this actually belong here?
        hideBottle();
        if(!$('.message.serve').is(":visible")){
            $('.message.serve').fadeIn(200);
        }
    };
    return {
        init: initializePour,
        end: endPour,
        start: startPour,
        stop: stopPour,
        timeoutLength: 1500 || parseInt(urlVars["timeout"], 10)
    }
})();


if( window.DeviceMotionEvent ) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
} else {
    $('.warning.noAccelerometer').show();
}

var showBottle = function(name) {
    $('#pour-screen')
        .find('.bottle-label h2')
        .text(name)
        .end()
        .fadeIn(200);
    $('html, body').animate({scrollTop: 0}, 800);
    hangover.pour.ready = true;
};
/**
 * End the pour action: Fade out the bottle, return to the bar, log the pour
 */
var hideBottle = function() {
    $('#pour-screen').fadeOut(200);
    hangover.pour.ready = false;
    hangover.currentIngredient = '';
};


/**
 * EVENT HANDLERS
 * *******************************************
 */
// Initialize the pour mode
$('#ingredients').on('click', 'a', function(e) {
    var liquorName = $(this).text();
    e.preventDefault();
    e.stopPropagation();
    //Set up the UI for a pouring action
    hangover.pour.init(liquorName);
});
// End the pour mode
$('#pour-screen').on('click', 'a', function(e) {
    e.preventDefault();
    e.stopPropagation();
    // Cancel out of the current pour
    hangover.pour.end();
});


// Open the message box
var showMessage = function(message, drink) {
    // Reset
    $('.message-hint, a.close').hide();
    $('.message-order, a.help').show();
    // Order
    var $message = $('.message.order');
    $message.find('p.message-order').text(message);
    $message.find('p.message-hint').html(drink.recipe());
    // Step through screens, to make sure people see the recipe
    $message.find('a.close').hide();
    $message.fadeIn(200);
    $('#overlay').fadeIn(200);
};
// Inside the message box
$('.message.order').on('click', 'a.help', function() {
    $(this).fadeOut(200);
    $('.message-order, a.help').fadeOut(200);
    $('.message-hint, a.close').fadeIn(200);
});
// Close the message box
$('.message.order').on('click', 'a.close', function() {
    $('.message.order, #overlay').fadeOut(200);
    // Scroll down
    $('html, body').animate({scrollTop: $('body').height()}, 800);
});

// SERVE the drink
$('.message.serve').on('click', 'a.serve', function() {
    var thisPatron = hangover.patrons.current();
    var theyLikedIt = thisPatron.evaluateDrink();
    if( theyLikedIt ){
        $('.message.serve p.serve').hide();
        $('.message.serve p.success span').text(thisPatron.messages.success);
        $('.message.serve p.success').show();
    } else {
        $('.message.serve p.serve').hide();
        $('.message.serve p.failure span').text(thisPatron.messages.failure);
        $('.message.serve p.failure').show();
    }
});
// TRY AGAIN button
$('.message.serve').on('click', 'a.retry', function() {
    var thisPatron = hangover.patrons.current();
    $('.message.serve p.failure').hide();
    $('.message.serve p.failure span').text('');
    $('.message.serve p.serve').show();
    thisPatron.drink.reset();
    $('.message.serve').fadeOut(200);
    // Reset feedback
    $('#bar .console').text('');
    showMessage(thisPatron.messages.order, thisPatron.order);
});
// YOU GOT IT RIGHT button
$('.message.serve').on('click', 'a.continue', function(){
    // Move patron off
    $('#patrons').addClass('done');
    // Reset message popup
    $('.message.serve').fadeOut(200);
    $('.message.serve p.success').hide();
    $('.message.serve p.success span').text('');
    $('.message.serve p.serve').show();
    // Reset feedback
    $('#bar .console').text('');
    // Set up next patron
    var patronB = new Patron(hangover.drinks.capeCod,{order:'Cape Codder for me, ifya don\' mind'}, 'img/ouro-drunk.png');
    hangover.patrons.add(patronB);
    hangover.patrons.next();
    // Next turn
    setTimeout(aManWalksIntoABar, 3000);
});


// Event handler for POURING

function deviceMotionHandler(event) {
    var acceleration = event.accelerationIncludingGravity,
        rotation = Math.round(((acceleration.y + 9.81) / 9.81) * 90),
        direction = (acceleration.z > 0) ? 1 : -1;
    if( hangover.debugMode ) {
        $('#debug #state').html([
            'rotation: ',
            rotation,
            '&deg;'
        ].join(''));
    }

    if( hangover.isPouring && hangover.counter > 5 ) {
        document.getElementById("glass").style.webkitTransform = "rotate(" + Math.round(((acceleration.x) / 9.81) * 90 * .5) + "deg)";
        hangover.counter = 0;
    } else {
        hangover.counter++;
    }

    if( -130 >= rotation || 130 <= rotation ) {
        //Start pouring
        if( !hangover.isPouring && hangover.pour.ready ) {
            hangover.pour.start();
        }
    } else {
        //Done pouring
        if( hangover.isPouring ) {
            hangover.pour.stop();
            // Don't hide the bottle immediately, as the pour may resume
            // and end several times in rapid succession. We give the user
            // a brief delay before we exit the pouring screen.
            hangover.pour.timeout = window.setTimeout(function() {
                hangover.pour.end();
            }, hangover.pour.timeoutLength);
        }
    }
}


/**
 * GAMEPLAY LOGIC
 * ******************************************
 */
var aManWalksIntoABar = (function() {
    var patronIndex = 0;
    return function() {
        var thisPatron = hangover.patrons.current(),
            $patrons = $('#patrons');
        // Clear out last patron
        $patrons.hide().removeClass('active').removeClass('done').show();
            // Switch to new patron
        $patrons.css('background-image', 'url(' + thisPatron.image + ')');
        $patrons.addClass('active');
        setTimeout(function() {
            showMessage(thisPatron.messages.order, thisPatron.order);
        }, 2500);
        patronIndex++;
    };
})();


/**
 * LOADING
 * *****************************************
 */
/**
 * (Temporarily) disable the default touchmove behaviors, to prevent scrolling on the title screen
 * (Via http://www.html5rocks.com/en/mobile/touch.html)
 */
var disableScrolling = function(event) {
    event.preventDefault();
};
document.body.addEventListener('touchmove', disableScrolling, false);


// First Customer
hangover.drinks = {
    martini: new Drink("Gin Martini", [
        {name: 'Gin', oz: 2},
        {name: 'Vermouth', oz: .5}
    ]),
    capeCod: new Drink("Cape Cod", [
        {name: 'Vodka', oz: 2},
        {name: 'Cranberry', oz: 3}
    ]),
    cosmopolitan: new Drink("Cosmopolitan", [
        {name: 'Vodka', oz: 1.25},
        {name: 'Triple Sec', oz: .25},
        {name: 'Lime Juice', oz: .25},
        {name: 'Cranberry', oz: .25}
    ])
};


(function() {
    var allPatrons = [
        new Patron(hangover.drinks.martini, {order: 'I want a Gin Martini, stirred.'}, 'img/ouro-sober.png'),
        new Patron(hangover.drinks.capeCod,{order:'Cape Codder for me, ifya don\' mind'}, 'img/ouro-drunk.png'),
        new Patron(hangover.drinks.cosmopolitan, {order:'Iiiii wanna WHISHkey shour, '}, 'img/ouro-drunker.png'),
        new Patron(hangover.drinks.cosmopolitan, {order:'Gimme a god damned Cosmo'}, 'img/ouro-angry.png')
    ];
    hangover.patrons.add(allPatrons[0]);
    hangover.patrons.add(allPatrons[1]);
    hangover.patrons.add(allPatrons[2]);
})();


$(document).ready(function() {
    $('#title-screen p').text('tap to begin');
    $('#title-screen').on('click', function() {
        // Re-enable scrolling
        document.body.removeEventListener('touchmove', disableScrolling, false);
        delete disableScrolling;
        $('#title-screen').fadeOut(600);
        // The first guest will enter in one second
        setTimeout(aManWalksIntoABar, 1000);
    });
});