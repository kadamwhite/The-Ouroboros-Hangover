/* Author: K.Adam White
 */

/**
 * Creates an instance of Drink.
 * @constructor
 * @this {Drink}
 * @param {String} name String value containing the name of the cocktail
 * @param {Array} ingredients Array of ingredient objects ( {name:'', oz:#} )
 */
function Drink(name, ingredients) {
    // Guard against invocation of Drink() without the new keyword
    if( !(this instanceof Drink) ) {
        return new Drink(name, ingredients);
    }
    this.name = name;
    this.ingredients = ingredients;

    return this; // Implied, but useful for readability
}
/**
 * Returns the total volume of the Drink, in ounces
 */
Drink.prototype.volume = function() {
    var i = 0, // For-loop counter
        max = this.complexity(), // Number of ingredients
        totalVolume = 0; // Running total
    for( i; i++; i < max ) {
        totalVolume = totalVolume + this.ingredients[i].oz;
    }
    return totalVolume;
};
/**
 * Returns the number of ingredients in the Drink
 */
Drink.prototype.complexity = function() {
    return this.ingredients.length;
};
Drink.prototype.recipe = function() {
    var recipe = '<em><strong>'+this.name+'</strong></em><br />';
    for(var i = 0, max = this.ingredients.length; i < max; i++){
        recipe = [recipe,
            this.ingredients[i].oz,
            'oz ',
            this.ingredients[i].name,
            '<br />'
        ].join('');
    }
    return recipe;
};


/**
 * Creates an instance of Patron
 */
function Patron(drink,messages,image){
    // Default image
    this.image = image || 'img/PatronSmall.png';
    // Guard against invocation of Patron() without the new keyword
    if( !(this instanceof Patron) ) {
        return new Patron(drink,messages,image);
    }
    this.drink = drink;
    // Override the default order (we need to know what they want)
    this.messages.order = messages.order || 'I\'ll have a '+drink.name;
}
Patron.prototype.messages = {
    order: 'I\'ll have the usual',
    success: 'Delicious!',
    failure: 'Ugh, what IS this crap!?'
    /* Messages should contain these values:
    messages.order : 'What to say when you order the drink',
    messages.success : 'What to say if it is made correctly',
    messages.failure : 'What to say if it is NOT made correctly'
    */
};
Patron.prototype.give = (function() {
    pourResults = {};
    var addPour = function(ingredient, quantity) {
        if(pourResults.ingredient) {
            pourResults[ingredient] += quantity;
        } else {
            pourResults[ingredient] = quantity;
        }
    };
    return addPour;
})();