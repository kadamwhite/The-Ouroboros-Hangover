/* Author: K.Adam White & Will Blair
*/
hangover = {
	isPouring:false,
	currentIngredient:null,
	pour : {
		pourStart:0,
		pourEnd:0
	},
	drink : {
		name: "foo",
		ingredients: [{name:"bar",oz:1},{name:"baz",oz:2}]
	},
	processPour : function () {
		var pour = hangover.pour;
		var diff = pour.pourEnd - pour.PourStart;//in ms
	}
};



if (window.DeviceOrientationEvent && window.DeviceMotionEvent) {
  window.ondeviceorientation = function(event) {
    alpha = Math.round(event.alpha);
    beta = Math.round(event.beta);
    gamma = Math.round(event.gamma);
	
	if((alpha <= 270 || alpha >= 100) 
		&& (beta >= -30 || beta <= 0)
		&& (gamma <= 70 || gamma >= -70) ) {
		//Start pouring
		if(!hangover.isPouring) {
			hangover.pour.pourStart = new Date();
		}
	} else {
		//Done pouring
		if(hangover.isPouring) {
			hangover.isPouring = false;
			hangover.pourEnd = new Date();
			
		}
	}
	/*
    $('body').html([
      '<p>alpha: ',
      alpha,
      '<br />beta: ',
      beta,
      '<br />gamma: ',
      gamma,
      '</p>'
    ].join(''));
	*/
  }
} else {
  //$('body').html('<h1>You should be using a GOD DAMNED PHONE</h1>');
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