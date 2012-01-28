/* Author: K.Adam White & Will Blair
*/
if (window.DeviceOrientationEvent && window.DeviceMotionEvent) {
  window.ondeviceorientation = function(event) {
    alpha = Math.round(event.alpha);
    beta = Math.round(event.beta);
    gamma = Math.round(event.gamma);
    $('body').html([
      '<p>alpha: ',
      alpha,
      '<br />beta: ',
      beta,
      '<br />gamma: ',
      gamma,
      '</p>'
    ].join(''));
  }
} else {
  $('body').html('<h1>You should be using a GOD DAMNED PHONE</h1>');
}