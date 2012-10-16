(function () {
"use strict"; // run code in ES5 strict mode

 /**
 * @typedef {{ getConstructor: Function, isSet: Function, isNotSet: Function, exists: Function, doesNotExist: Function, isInstanceOf: Function, isNotInstanceOf: Function, isA: Function, isNotA: Function, isAn: Function, isNotAn: Function, isTypeOf: Function, isNotTypeOf: Function, implements: Function, doesNotImplement: Function, provides: Function, doesNotProvide: Function }}
 */
var Subject = {},

/**
 * Reusing a context object is faster instead of creating a new one
 * @see http://jsperf.com/new-vs-reuse-obj
 *
 * @private
 * @type {Object}
 */
context = {},

/**
 * Contains all primitives that can't be checked via instanceof
 *
 * @private
 * @type {Object}
 */
primitives = {
    "String": String,
    "Boolean": Boolean,
    "Number": Number
};

/**
 * Returns an object, that provides some methods to test the type of the subject.
 * There is for every test a negated test to improve the readability of your code.
 * So if you want to test for instanceOf() === false just call notInstanceOf().
 *
 * The subject of your test can be every possible value in JavaScript. You don't
 * have to check if it's null or undefined before calling this method.
 *
 * @param {*} subject the subject of the test
 * @return {Subject}
 */
function value(subject) {
    // Shortcut if value is used several times on the same subject
    if (context.subject !== subject) {
        setup(subject);

        subject = context.subject;

        if (subject !== undefined && subject !== null) {
            // @see http://bonsaiden.github.com/JavaScript-Garden/#types.typeof
            context.subjectType = Object.prototype.toString.call(subject).slice(8, -1);
            context.subjectConstructor = subject.constructor;
            context.isSet = true;
        }
    }

    return Subject;
}

/**
 * Returns subject.constructor. If the subject is null or undefined this function returns null.
 *
 * @return {Function|null}
 */
function getConstructor() {
    return context.subjectConstructor;
}
Subject.getConstructor = getConstructor;
Subject.getClass = getConstructor;

/**
 * Returns true if the given subject is neither undefined nor null
 *
 * @return {Boolean}
 */
function isSet() {
    return context.isSet;
}
Subject.isSet = isSet;
Subject.exists = isSet;

/**
 * @see Subject#isSet
 * @type {Function}
 */
var isNotSet = getNegation(isSet);
Subject.isNotSet = isNotSet;
Subject.doesNotExist = isNotSet;

/**
 * Tests if the given object is a constructor of the subject. For native
 * types, just pass the corresponding constructor (e.g. String)
 *
 * If the subject.constructor exposes an Extends-property, this will be checked first.
 *
 * @param {Function} Class
 * @throws {TypeError}
 * @return {Boolean}
 */
function isInstanceOf(Class) {
    var primitive;

    if (context.isSet === false) {
        return false;
    }

    if (context.subject instanceof Class) {
        return true;
    }

    primitive = primitives[context.subjectType];
    if (typeof primitive === "function") {
        if (Class === Object) {
            // If we're checking for an object, primitive types are treated as objects.
            // This is not true in pure JavaScript, but since you can write
            // var num = 3; num.toString(); I think it's legitimate to treat them as objects.
            return true;
        }
        if (Class === Number) {
            // Returns false for NaN and Infinity
            return isFinite(context.subject);
        }
        return primitive === Class;
    }

    return checkExtendsProperty(context.subjectConstructor, Class);
}
Subject.isInstanceOf = isInstanceOf;
Subject.isA = isInstanceOf;
Subject.isAn = isInstanceOf;
Subject.isTypeOf = isInstanceOf;

/**
 * @see Subject#isInstanceOf
 * @type {Function}
 */
var isNotInstanceOf = getNegation(isInstanceOf);
Subject.isNotInstanceOf = isNotInstanceOf;
Subject.isNotA = isNotInstanceOf;
Subject.isNotAn = isNotInstanceOf;
Subject.isNotTypeOf = isNotInstanceOf;

//TODO Maybe I'll remove this method
/**
 * Tests if the given subject implements a specific Interface. This
 * function assumes, that the subject's constructor offers an Implements-array,
 * that contains all implemented interfaces.
 *
 * @param {Object} Interface
 * @throws {TypeError}
 * @return {Boolean}
 */
/*function isImplementing(Interface) {
    var Implements;

    if (typeof Interface !== "object" || Interface === null || Array.isArray(Interface)) {
        throw new TypeError("Interface must be an object");
    }

    if (context.isSet === false) {
        return false;
    }
    Implements = context.subjectConstructor.Implements;
    if (Array.isArray(Implements)) {
        return Implements.indexOf(Interface) !== -1;
    } else {
        return false;
    }
}
Subject.implements = isImplementing;
Subject.provides = isImplementing;*/

/**
 * @see Subject#doesNotImplement
 * @type {Function}
 */
/*var doesNotImplement = getNegation(isImplementing);
Subject.doesNotImplement = doesNotImplement;
Subject.doesNotProvide = doesNotImplement;*/

/**
 * Resets all values of the context object.
 *
 * @private
 * @param subject
 */
function setup(subject) {
    context.subject = subject;
    context.subjectType = null;
    context.subjectConstructor = null;
    context.isSet = false;
}

/**
 * Returns a function that calls the given function an negates the returned value
 *
 * @private
 * @return {Function}
 */
function getNegation(func) {
    return function negate() {
        return !func.apply(this, arguments);
    };
}

/**
 * Recursive check on Class.Extends for the given SuperClass
 *
 * @private
 * @param {Function} Class
 * @param {Function} SuperClass
 * @return {Boolean}
 */
function checkExtendsProperty(Class, SuperClass) {
    var Extends = Class.Extends;

    if (typeof Extends === "function") {
        return Extends === SuperClass || checkExtendsProperty(Extends, SuperClass);
    } else {
        return false;
    }
}

if (typeof module === "undefined") {
    window.jhnns = window.jhnns || {};
    window.jhnns.value = value;
} else {
    module.exports = value;
}

})();