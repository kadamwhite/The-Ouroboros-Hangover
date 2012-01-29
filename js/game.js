/* Author: K.Adam White & Will Blair
 */

hangover = {
    isPouring: false,
    currentIngredient: null,
    patrons: []
};

/* Setup */
$('#ingredients').attr('style',function(){
    var numBottles = $(this).find('li').length,
        width = numBottles * 50;
    return 'width: '+parseInt(width,10)+'px';
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

if(urlVars["debug"] === "true") {
    hangover.debugMode = true;
    $('body').addClass('debug');
} else {
    hangover.debugMode = false;
}


/**
 * Define the pour itself
 */
hangover.pour = (function(){
    var pourCounts = [],
        startTime = null,
        endTime = null;
    /**
     * Return the total length of time for this pour instance
     * @param {Boolean} returnAsOunces Whether to return the duration as milliseconds (when false, default) or as ounces (when true)
     */
    var duration = function(returnAsOunces) {
        var totalDuration = 0;
        for( var i = 0, max = pourCounts.length; i < max; i++ ){
            totalDuration = totalDuration + pourCounts[i];
        }
        if(returnAsOunces) {
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
    var initializePour = function(name){
        hangover.currentIngredient = name;
        showBottle(name);
    };
    /**
     * Set the start time for a component of this pour
     */
    var startPour = function(){
        hangover.isPouring = true;
        $('#pour-screen .bottle').addClass('pouring');
        if(hangover.debugMode) {
            $('#debug #pouring').html('POURING');
        }
        startTime = new Date();
        // If we're counting down to the end() of the pour, clear the timeout
        if(typeof hangover.pour.timeout === 'number'){
            window.clearTimeout(hangover.pour.timeout);
            delete hangover.pour.timeout;
        }
    };
    /**
     * Set the end time for a component of this pour, and log the duration
     */
    var stopPour = function(){
        hangover.isPouring = false;
        $('#pour-screen .bottle').removeClass('pouring');
        $('#debug #pouring').html('');
        endTime = new Date();
        // Log the total length of the pour to the pourCounts array
        pourCounts.push(endTime-startTime);
        // Reset Start and End times
        startTime = null;
        endTime = null;
    };
    /**
     * Conclude this pour, and announce the final duration
     */
    var endPour = function() {
        if(pourCounts.length === 0) {
            return;
        }
        // Announce that the pour is complete
        $('#debug #log').append([
            '<li>',
            duration(false),
            'ms (',
            duration(true),
            ' oz)</li>'
        ].join(''));
        // Remove timeout variable
        delete hangover.pour.timeout;
        // Reset pourCounts
        pourCounts.length = 0;
        // Hide bottle TODO: Does this actually belong here?
        hideBottle();
    };
    return {
        init: initializePour,
        end: endPour,
        start: startPour,
        stop: stopPour,
        timeoutLength: 1000 || parseInt(urlVars["timeout"], 10)
    }
})();
/**
 * End the pour action: Fade out the bottle, return to the bar, log the pour
 */


if( window.DeviceMotionEvent ) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
} else {
    $('.warning.noAccelerometer').show();
}

var showBottle = function(name){
    $('#pour-screen')
        .find('.bottle-label h2')
        .text(name)
    .end()
    .fadeIn(200);
    $('html, body').animate({scrollTop: 0}, 800);
    hangover.pour.ready = true;
};
var hideBottle = function() {
    $('#pour-screen').fadeOut(200);
    hangover.pour.ready = false;
};












/**
 * EVENT HANDLERS
 * *******************************************
 */
// Initialize the pour mode
$('#ingredients').on('click', 'a', function(e){
    var liquorName = $(this).text();
    e.preventDefault();
    e.stopPropagation();
    //Set up the UI for a pouring action
    hangover.pour.init(liquorName);
});
// End the pour mode
$('#pour-screen').on('click', 'a', function(e){
    e.preventDefault();
    e.stopPropagation();
    // Cancel out of the current pour
    hangover.pour.end();
});


// Open the message box
var showMessage = function(message, drink){
    var $message = $('.message');
    $message.find('p.message-order').text(message);
    $message.find('p.message-hint').html(drink.recipe());
    // Step through screens, to make sure people see the recipe
    $message.find('a.close').hide();
    $message.fadeIn(200);
    $('#overlay').fadeIn(200);
};
// Inside the message box
$('.message').on('click','a.help',function(){
    $(this).fadeOut(200);
    $('.message-order, a.help').fadeOut(200);
    $('.message-hint, a.close').fadeIn(200);
});
// Close the message box
$('.message').on('click','a.close',function(){
    $('.message, #overlay').fadeOut(200);
    // Scroll down
    $('html, body').animate({scrollTop: $('body').height()}, 800);
});


// Event handler for POURING

function deviceMotionHandler(event){
    var acceleration = event.accelerationIncludingGravity,
        rotation = Math.round(((acceleration.y + 9.81) / 9.81) * 90);
    if(hangover.debugMode) {
        $('#debug #state').html([
            'rotation: ',
            rotation,
            '&deg;'
        ].join(''));
    }

    if( -130 >= rotation || 130 <= rotation ) {
        //Start pouring
        if( !hangover.isPouring && hangover.pour.ready) {
            hangover.pour.start();
        }
    } else {
        //Done pouring
        if( hangover.isPouring ) {
            hangover.pour.stop();
            // Don't hide the bottle immediately, as the pour may resume
            // and end several times in rapid succession. We give the user
            // a brief delay before we exit the pouring screen.
            hangover.pour.timeout = window.setTimeout(function(){
                hangover.pour.end();
            }, hangover.pour.timeoutLength);
        }
    }
}









/**
 * GAMEPLAY LOGIC
 * ******************************************
 */
var aManWalksIntoABar = (function(){
    var patronIndex = 0;
    return function(){
        var thisPatron = hangover.patrons[patronIndex];
        // Clear out last patron
        $('#patrons').hide().removeClass('active').removeClass('done')
            // Switch to new patron
            .css('background-image','url('+thisPatron.image+')')
            // Move patron on-screen
            .show().addClass('active');
        setTimeout(function(){
            showMessage(thisPatron.messages.order, thisPatron.drink);
        }, 2500);
        patronIndex++;
    };
})();



(function(){
    var drinkOrders = [],
        martini = new Drink("Gin Martini",[
            Ingredient('Gin',2),
            Ingredient('Dry Vermouth',.5)
        ]);
    drinkOrders.push(martini);

    hangover.patrons.push(new Patron(drinkOrders[0],{order:'I want a Gin Martini, stirred.'}));
})();


/**
 * LOADING
 * *****************************************
 */
/**
 * Disable the default touchmove behaviors, to prevent iOS overscrolling
 * (Via http://www.html5rocks.com/en/mobile/touch.html)
 */
var disableScrolling = function(event) {
    event.preventDefault();
};
document.body.addEventListener('touchmove', disableScrolling, false);


// First Customer
$(document).ready(function(){
    $('#title-screen p').text('tap to begin');
    $('#title-screen').on('click',function(){
        // Re-enable scrolling
        document.body.removeEventListener('touchmove', disableScrolling, false);
        $('#title-screen').fadeOut(600);
        // The first guest will enter in one second
        setTimeout(aManWalksIntoABar, 1000);
    });
});