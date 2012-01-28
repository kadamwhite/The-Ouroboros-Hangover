/* Author: K.Adam White & Will Blair
 */

hangover = {
    isPouring: false,
    currentIngredient: null,
    pour: {
        start: 0,
        end: 0
    },
    drink: {
        name: "foo",
        ingredients: [
            {name: "bar", oz: 1},
            {name: "baz", oz: 2}
        ]
    },
    processPour: function() {
        var pour = hangover.pour;
        var diff = pour.pourEnd - pour.PourStart;//in ms
    }
};
/**
 * Return the length of the pour event, in milliseconds
 */
hangover.pour.time = function() {
    return this.end - this.start;
};


if( window.DeviceOrientationEvent && window.DeviceMotionEvent ) {
    window.ondeviceorientation = function(event) {
        alpha = Math.round(event.alpha);
        beta = Math.round(event.beta);
        gamma = Math.round(event.gamma);
        /* Update values every 10th of a second */
        //setInterval(function(){
        $('#debug #state').html([
            'alpha: ',
            alpha,
            '<br />beta: ',
            beta,
            '<br />gamma: ',
            gamma
        ].join(''));
        //}, 100);

        if( (90 <= alpha && alpha <= 280)
        //&& (-30 <= beta && beta <= 0)
        //&& (-70 <= gamma && gamma <= 70)
        ) {
            //Start pouring
            if( !hangover.isPouring ) {
                hangover.isPouring = true;
                hangover.pour.start = new Date();
                $('#debug #pouring').html('POURING');
            }
        } else {
            //Done pouring
            if( hangover.isPouring ) {
                hangover.isPouring = false;
                hangover.pour.end = new Date();
                $('#debug #pouring').html('');
                // Log the length of the pour (in ms)
                $('#debug #log').append('<li>'+hangover.pour.time()+'ms ('+millisecondsToOunces(hangover.pour.time())+' oz)</li>');
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