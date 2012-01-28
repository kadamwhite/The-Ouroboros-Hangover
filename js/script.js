/* Author: K.Adam White & Will Blair
*/

if (window.DeviceMotionEvent==undefined) {
	$('body').html('<h1>You should be using a GOD DAMNED PHONE</h1>');
} 
else {
	window.ondeviceorientation = function(event) {
		alpha = Math.round(event.alpha);
		beta = Math.round(event.beta);
		gamma = Math.round(event.gamma);
	}
}