value
=====
**Convenient high-performance type-checking for JavaScript**

value is designed to ease [type-checking in JavaScript](http://bonsaiden.github.com/JavaScript-Garden/#types.typeof) while keeping performance in mind. It comes with a [fluent api](http://martinfowler.com/bliki/FluentInterface.html) to improve the readability of your code. Use value to sanitize function parameters and to provide better error messages if some type is unexpected. 

[![Build Status](https://secure.travis-ci.org/jhnns/value.png?branch=master)](http://travis-ci.org/jhnns/value)


<br />

Installation
------------

`npm install value`

If you're not using a CommonJS-system in the browser value is namespaced under `window.jhnns.value`.

<br />

Examples
--------



```javascript
var value = require("value");

// value takes every possible type in JavaScript
// and provides some methods to test for the type.
value(undefined).isAn(Object); // = false
value(null).isAn(Object); // = false
value({}).isAn(Object); // = true
value(2).isA(Number); // = true
value("hello").isA(String); // = true
value(/myRegExp/).isA(RegExp); // = true
value(document.createElement("a")).isA(HTMLAnchorElement); // = true

// value also provides a negation for better readability
value(2).isNotA(String); // = true

// you can also check conveniently for null and undefined with one call
value(undefined).exists(); // = false
value(null).doesNotExist(); // = true
```

<br />

API
--------

### isA(constructor): Boolean <sup>*Aliases: isAn, isInstanceOf, isTypeOf*</sup>


Tests if the subject is a child of the constructor. Respects the complete inheritance chain.

### isNotA(constructor): Boolean <sup>*Aliases: isNotAn, isNotInstanceOf, isNotTypeOf*</sup>

Negation of `isA()`

### exists(): Boolean <sup>*Aliases: isSet*</sup>

Returns true when the subject was either `null` or `undefined`

### doesNotExist(): Boolean <sup>*Aliases: isNotSet*</sup>

Negation of `exists()`

### getConstructor(): Function|null

Returns `subject.constructor` or `null` if the subject was `null` or `undefined`.

<br />

Fixes
--------

value contains a set of opinionated presumptions to avoid common and annoying pitfalls. It has been designed to act like you would expect from a language like ActionScript with optional static types. The returned value is not always conform with the JavaScript type-specification.

This is a collection of cases where value acts differently to the original `typeof`-operator:

### null is not an Object

In contrast to `typeof null === "object"`

```javascript
value(null).isAn(Object); // = false
```

### new String() is a String

In constrast to `typeof new String() === "object"`

```javascript
value(new String()).isA(String); // = true 
```

### All set values are objects

```javascript
value("hello").isAn(Object); // = true 
value(new String("hello")).isAn(Object); // = true 
```

The primitive value `"hello"` is not an Object in JavaScript. But it actual acts like an Object because it is [casted to an Object](http://stackoverflow.com/a/2051893) internally when trying to access a property.

So: Everything that is not `null` and `undefined` is an Object. If you want to test whether the given value is a plain Object or not, just call `getConstructor()`:

```javascript
value({}).getConstructor() === Object; // true
value("hello").getConstructor() === Object; // false
```

Why not directly accessing the `constructor`-property? Well, in this case you won't have to write:

```javascript
if (myVar && myVar.constructor === Object) { ... }
```

### Infinity and NaN are not numbers

In constrast to `typeof NaN === "number"` and `typeof Infinity === "number"`

```javascript
value(NaN).isA(Number); // = false
value(Infinity).isA(Number); // = false
```

While `NaN` and `Infinity` are numbers from a theoretical point of view it's a common mistake when trying to sanitize calculation parameters. value assumes that numbers are numeric - that's why `NaN` and `Infinity` are not numbers.


<br />

Notes
--------

### arguments is not an Array

This stays the same: `value(arguments).isAn(Array)` will return false because `arguments` doesn't provide all methods of `Array`.

