"use strict"; // run code in ES5 strict mode

var _expect,
    value,
    builtInConstructors = [Boolean, Number, String, Array, Object, Date, RegExp, Error];

if (typeof require === "function") {
    _expect = require("expect.js");
    value = require("../lib/value.js");
} else {
    value = window.jhnns.value;
    _expect = expect;
}

describe("value", function () {
    describe(".getConstructor()", function () {
        function A() {}

        function B() {}
        B.Extends = A;

        it("should be aliased with 'getClass'", function () {
            var valueObj = value(null);

            _expect(valueObj.getConstructor).to.be(valueObj.getClass);
        });
        it("should be the built-in constructor when passing a built-in type", function () {
            var builtIns = [true, 2, "2", [1, 2, 3], {one: "one", two: "two"},
                    new Date(), /hello/gi, new Error()];

            builtIns.forEach(function (builtIn, index) {
                 _expect(value(builtIn).getConstructor()).to.be(builtInConstructors[index]);
            });
        });
        it("should be the constructor function when passing a custom type", function () {
            var a = new A(),
                b = new B();

            _expect(value(a).getConstructor()).to.be(A);
            _expect(value(b).getConstructor()).to.be(B);
        });
        it("should be null when passing null or undefined", function () {
            _expect(value(undefined).getConstructor()).to.be(null);
            _expect(value(null).getConstructor()).to.be(null);
        });
    });
    describe(".isSet()", function () {
        it("should return true when the value is neither null nor undefined", function () {
            _expect(value(false).isSet()).to.be(true);
            _expect(value(2).isSet()).to.be(true);
            _expect(value(0).isSet()).to.be(true);
            _expect(value("hello").isSet()).to.be(true);
            _expect(value("").isSet()).to.be(true);
            _expect(value([1, 2, 3]).isSet()).to.be(true);
            _expect(value({one: 1, two: 2, three: 3}).isSet()).to.be(true);
            _expect(value(function () {}).isSet()).to.be(true);
            _expect(value(new Date()).isSet()).to.be(true);
            _expect(value(/hello/gi).isSet()).to.be(true);
            _expect(value(new Error()).isSet()).to.be(true);
            _expect(value(NaN).isSet()).to.be(true);
            _expect(value(Infinity).isSet()).to.be(true);
            if (typeof window !== "undefined") {
                _expect(value(document).isSet()).to.be(true);
                _expect(value(window).isSet()).to.be(true);
                _expect(value(document.createElement("a")).isSet()).to.be(true);
            }
        });
        it("should return false when the value is null, undefined", function () {
            _expect(value(null).isSet()).to.be(false);
            _expect(value(undefined).isSet()).to.be(false);
        });
    });
    describe(".isNotSet()", function () {
        // We're assuming that the negation works when this test runs
        it("should return true when the value is null", function () {
            _expect(value(null).isNotSet()).to.be(true);
        });
    });
    describe(".instanceOf()/.typeOf()", function () {
        function A() {}

        function B() {}

        function C() {}
        C.prototype = A.prototype;

        // Inheriting from a native function
        function MyNativeExtension() {}

        it("should be aliased with 'typeOf'", function () {
            var valueObj = value(null);

            _expect(valueObj.typeOf).to.be(valueObj.instanceOf);
        });
        it("should work with built-in values", function () {
            var builtInValues = [true, 2, "2", [1, 2, 3], {one: "one", two: "two"},
                    new Date(), /hello/gi, new Error()];

            builtInValues.forEach(function (builtIn, index) {
                 _expect(value(builtIn).instanceOf(builtInConstructors[index])).to.be(true);
            });

            if (typeof window !== "undefined") {
                _expect(value(document.createElement("a")).instanceOf(HTMLAnchorElement)).to.be(true);
            }
        });
        it("should not treat built-in values as Object (except Object itself)", function () {
            var builtInValues = [true, 2, "2", [1, 2, 3],
                    new Date(), /hello/gi, new Error()];

            builtInValues.forEach(function (builtIn, index) {
                 _expect(value(builtIn).instanceOf(Object)).to.be(false);
            });
        });
        it("should not treat strings, numbers or booleans created with the new operator as Object", function () {
            _expect(value(new String("hello")).typeOf(Object)).to.be(false);
            _expect(value(new Number(2)).typeOf(Object)).to.be(false);
            _expect(value(new Boolean(true)).typeOf(Object)).to.be(false);
        });
        it("should detect undefined", function () {
            value(undefined).typeOf(undefined);
        });
        it("should detect null", function () {
            value(null).typeOf(null);
        });
        it("should avoid casting", function () {
            _expect(value("2").instanceOf(Number)).to.be(false);
            _expect(value(0).instanceOf(Boolean)).to.be(false);
            _expect(value([1, 2, 3]).instanceOf(String)).to.be(false);
        });
        it("should treat null and undefined as non-objects", function () {
            _expect(value(null).instanceOf(Object)).to.be(false);
            _expect(value(undefined).instanceOf(Object)).to.be(false);
        });
        it("should not work with arguments when testing for an Array", function () {
            _expect(value(arguments).instanceOf(Array)).to.be(false);
        });
        it("should work with prototype inheritance", function () {
            var c = new C(),
                valueC = value(c);

            _expect(valueC.instanceOf(A)).to.be(true);
            _expect(valueC.instanceOf(C)).to.be(true);
        });
        it("should return true when inheriting from built-in constructors", function () {
            var myNativeExtension,
                originalPrototype = MyNativeExtension.prototype;

            builtInConstructors.forEach(function (BuiltInConstructor, index) {
                MyNativeExtension.prototype = builtInConstructors[index].prototype;
                myNativeExtension = new MyNativeExtension();
                _expect(value(myNativeExtension).instanceOf(BuiltInConstructor)).to.be(true);

                MyNativeExtension.prototype = originalPrototype;
            });
        });
        it("should return false when the prototypes are not inheriting", function () {
            var c = new C(),
                valueC = value(c);

            _expect(valueC.instanceOf(B)).to.be(false);
        });
        it("should return false when you check an undefined or null value", function () {
            _expect(value(null).instanceOf(B)).to.be(false);
            _expect(value(undefined).instanceOf(B)).to.be(false);
        });
        it("should return false for NaN and Infinity when checking for Number", function () {
            _expect(value(NaN).instanceOf(Number)).to.be(false);
            _expect(value(Infinity).instanceOf(Number)).to.be(false);
        });
        it("should throw an exception when passing a non-function", function () {
            var somethingIs = value("this value doesn't matter");

            _expect(
                function () {
                    somethingIs.instanceOf(undefined);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.instanceOf(null);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.instanceOf(false);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.instanceOf(2);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.instanceOf("2");
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.instanceOf([1, 2, 3]);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.instanceOf({one: 1, two: 2, three: 3});
                }).to.throwException();
        });
        it("should also accept case-insensitive string values as types (like typeof)", function () {
            _expect(value(true).typeOf("boolean")).to.be(true);
            _expect(value(2).typeOf("Number")).to.be(true);
            _expect(value("").typeOf("String")).to.be(true);
            _expect(value({}).typeOf("Object")).to.be(true);
            _expect(value([]).typeOf("array")).to.be(true);
        });
    });
    describe(".notInstanceOf()/.notTypeOf()", function () {
        it("should be aliased with 'notTypeOf'", function () {
            var valueObj = value(null);

            _expect(valueObj.notTypeOf).to.be(valueObj.notInstanceOf);
        });
        // We're assuming that the negation works when this test runs
        it("should work with built-in values", function () {
            _expect(value("2").notInstanceOf(String)).to.be(false);
        });
    });
    describe(".each", function () {
        var homoArr = [1, 2, 3],
            heteroArr = [1, "2", 3],
            heteroNullArr = [1, 2, null],
            homoObj = { one: 1, two: 2, three: 3 },
            heteroObj = { one: 1, two: "2", three: 3 },
            heteroNullObj = { one: 1, two: 2, three: null };

        describe(".isSet()", function () {
            it("should return true when every value(item).isSet returned true", function () {
                _expect(value(homoArr).each.isSet()).to.be(true);
                _expect(value(homoObj).each.isSet()).to.be(true);
                _expect(value(heteroArr).each.isSet()).to.be(true);
                _expect(value(heteroNullArr).each.isSet()).to.be(false);
                _expect(value(heteroObj).each.isSet()).to.be(true);
                _expect(value(heteroNullObj).each.isSet()).to.be(false);
            });
        });
        describe(".instanceOf()/.typeOf()", function () {
            it("should be aliased with 'typeOf'", function () {
                var valueObj = value(null);

                _expect(valueObj.each.typeOf).to.be(valueObj.each.instanceOf);
            });
            it("should return true when every value(item).instanceOf returned true", function () {
                _expect(value(homoArr).each.instanceOf(Number)).to.be(true);
                _expect(value(homoObj).each.instanceOf(Number)).to.be(true);
                _expect(value(heteroArr).each.instanceOf(Number)).to.be(false);
                _expect(value(heteroObj).each.instanceOf(Number)).to.be(false);
            });
        });
    });
    describe(".any", function () {
        var homoArr = [1, 2, 3],
            heteroArr = [1, "2", 3],
            heteroNullArr = [1, 2, null],
            homoObj = { one: 1, two: 2, three: 3 },
            heteroObj = { one: 1, two: "2", three: 3 },
            heteroNullObj = { one: 1, two: 2, three: null };

        describe(".isNotSet()", function () {
            it("should return true when any value(item).isSet returned false", function () {
                _expect(value(homoArr).any.isNotSet()).to.be(false);
                _expect(value(homoObj).any.isNotSet()).to.be(false);
                _expect(value(heteroArr).any.isNotSet()).to.be(false);
                _expect(value(heteroNullArr).any.isNotSet()).to.be(true);
                _expect(value(heteroObj).any.isNotSet()).to.be(false);
                _expect(value(heteroNullObj).any.isNotSet()).to.be(true);
            });
        });
        describe(".notInstanceOf()/.typeOf()", function () {
            it("should be aliased with 'notTypeOf'", function () {
                var valueObj = value(null);

                _expect(valueObj.any.notTypeOf).to.be(valueObj.any.notInstanceOf);
            });
            it("should return true when any value(item).instanceOf returned false", function () {
                _expect(value(homoArr).any.notInstanceOf(Number)).to.be(false);
                _expect(value(homoObj).any.notInstanceOf(Number)).to.be(false);
                _expect(value(heteroArr).any.notInstanceOf(Number)).to.be(true);
                _expect(value(heteroObj).any.notInstanceOf(Number)).to.be(true);
            });
        });
    });
});

