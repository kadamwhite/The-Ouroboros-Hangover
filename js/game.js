/* Author: K.Adam White & Will Blair
 */

hangover = {
    isPouring: false,
    currentIngredient: null,
    patrons: []
};
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
        $('#debug #pouring').html('POURING');
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
    };
    return {
        init: initializePour,
        start: startPour,
        stop: stopPour,
        end: endPour
    }
})();
/**
 * End the pour action: Fade out the bottle, return to the bar, log the pour
 */


if( window.DeviceMotionEvent ) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
    function deviceMotionHandler(event){
        var acceleration = event.accelerationIncludingGravity;

        var rotation = Math.round(((acceleration.y + 9.81) / 9.81) * 90);
        /* Update values every 10th of a second */
        setInterval(function(){
            $('#debug #state').html([
                'rotation: ',
                rotation,
                '&deg;'
            ].join(''));
        }, 100);

        if( -130 >= rotation || 130 <= rotation ) {
            //Start pouring
            if( !hangover.isPouring ) {
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
                }, 1500);
            }
        }
    }
} else {
    $('.warning.noAccelerometer').show();
}

var showBottle = function(name){
    $('#pour-screen')
        .find('.bottle-label')
        .text(name)
    .end()
    .fadeIn(200);
    $('html, body').animate({scrollTop: 0}, 800);
};
var hideBottle = function() {
    $('#pour-screen').fadeOut(200);
};






/* Setup */
$('#ingredients').attr('style',function(){
    var numBottles = $(this).find('li').length,
        width = numBottles * 50;
    return 'width: '+parseInt(width,10)+'px';
});





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
// Close the pour mode
$('#pour-screen').on('click', 'a', function(e){
    e.preventDefault();
    e.stopPropagation();
    // Cancel out of the current pour
    hangover.pour.end();
    // Hide bottle TODO: Does this actually belong here?
    hideBottle();
});
// Close the request pop-up
$('.message').on('click','a.close',function(){
    $('.message').fadeOut(200);
    // Scroll down
    $('html, body').animate({scrollTop: $('body').height()}, 800);
});
$('.message').on('click','a.help',function(){
    $(this).fadeOut(200);
    $('.message-order').fadeOut(200);
    $('.message-hint').fadeIn(200);
});

var showMessage = function(message, drink){
    var $message = $('.message');
    $message.find('p.message-order').text(message);
    $message.find('p.message-hint').html(drink.recipe());
    $message.fadeIn(200);
};





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
        martini = new Drink("Martini",[
            new Ingredient('Gin',2),
            new Ingredient('Dry Vermouth',.5)
        ]);
    drinkOrders.push(martini);

    hangover.patrons.push(new Patron(drinkOrders[0],{order:'I want a Gin Martini, stirred.'}));

    // First Customer
    aManWalksIntoABar();
})();