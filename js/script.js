/* Author: K.Adam White
 */

/**
 * Creates an instance of Drink.
 * @constructor
 * @this {Drink}
 * @param {String} name String value containing the name of the cocktail
 * @param {Ingredient[]} ingredients Array of Ingredients objects
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
}

/**
 * Creates an instance of Ingredient
 * @constructor
 * @this {Ingredient}
 * @param {String} name The name of the ingredient.
 * @param {Number} quantityInOunces The amount of the ingredient to use
 * TODO: find a way to make sure this value matches other drinks with the same ingredient
 */
function Ingredient(name, quantityInOunces) {
    // Guard against invocation of Ingredient() without the new keyword
    if( !(this instanceof Ingredient) ) {
        return new Ingredient(name, quantityInOunces);
    }
    // Format our strings as a nice object literal
    return {
        name: name,
        oz: quantityInOunces
    };
}