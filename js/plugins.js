window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){arguments.callee=arguments.callee.caller;var a=[].slice.call(arguments);(typeof console.log==="object"?log.apply.call(console.log,console,a):console.log.apply(console,a))}};
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL
 * Retrieved via https://gist.github.com/1321768
 */
(function($) {
    var o = $({});
    $.subscribe = function() {
        o.on.apply(o, arguments);
    };
    $.unsubscribe = function() {
        o.off.apply(o, arguments);
    };
    $.publish = function() {
        o.trigger.apply(o, arguments);
    };
}(jQuery));
/* From Ben's gist (gist.github.com/661855):
 * Just use this handy terminology guide
 * (jQuery events term → Pub/Sub term),
 * and everything should make sense:
 *   - on → subscribe
 *   - off → unsubscribe
 *   - trigger → publish
 *   - type → topic
 */
/*  // Super-basic example:

    function handle(e, a, b, c) {
    // `e` is the event object, you probably don't care about it.
    console.log(a + b + c);
    };

    $.subscribe("/some/topic", handle);

    $.publish("/some/topic", [ "a", "b", "c" ]);
    // logs: abc

    $.unsubscribe("/some/topic", handle); // Unsubscribe just this handler

    // Or:

    $.subscribe("/some/topic", function(e, a, b, c) {
    console.log(a + b + c);
    });

    $.publish("/some/topic", [ "a", "b", "c" ]);
    // logs: abc
    // Unsubscribe all handlers for this topic
    $.unsubscribe("/some/topic");
*/