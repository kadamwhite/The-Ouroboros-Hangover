/* Author: K.Adam White & Will Blair
 */

hangover = {
    isPouring: false,
    currentIngredient: null
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

        var x = Math.round(acceleration.x),
            y = Math.round(acceleration.y),
            yRotation = Math.round(((y + 9.81) / 9.81) * 90),
            z = Math.round(acceleration.z),
            facingUp = (z > 0) ? 1 : -1;
        /* Update values every 10th of a second */
        //setInterval(function(){
        $('#debug #state').html([
            'x: ', x, ' (', Math.round(((x) / 9.81) * -90), ' deg)',
            '<br />y: ', yRotation,
            '<br />z: ', z
        ].join(''));
        //}, 100);

        $('#ingredients').on('click', 'a', function(){
            //Set up the UI for a pouring action
            $('#bottle').fadeIn();
        });


        if( (-130 >= yRotation || 130 <= yRotation)
        //&& (-30 <= beta && beta <= 0)
        //&& (-70 <= gamma && gamma <= 70)
        ) {
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
    //$('body').html('<h1>You should be using a GOD DAMNED PHONE</h1>');
}

var millisecondsToOunces = function(milliseconds){
    var seconds = milliseconds / 1000,
        oz = seconds / 1.5; // With a standard pourer, rate is 1.5 seconds per ounce
    return oz.toFixed(2);
}

/*
 Z axis - Positive perpendicular of the phone's screen
 Y axis - Positive towards the top of the phone
 X axis - Positive towards the right side of the screen.

 Alpha - Rotation around the z axis. [0,360)
 right - <=270 degrees
 left  - >=100 degrees

 Beta - Rotation around the x axis [-180,180)
 left -  >= -30
 right-  <= 0

 Gamma - Rotation around the y axis [-90,90]

 left -  <= 70
 right - >= -70
 */

/**
 * Disable the default touchmove behaviors, to prevent iOS overscrolling
 * (Via http://www.html5rocks.com/en/mobile/touch.html)
 */
/*
document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);*/
