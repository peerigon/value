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
    describe("#getConstructor", function () {
        function A() {}

        function B() {}
        B.Extends = A;

        it("should be aliased with 'getClass'", function () {
            var valueObj = value(null);

            _expect(valueObj.getConstructor).to.be(valueObj.getClass);
        });
        it("should be the built-in constructor when passing a built-in type", function () {
            var builtIns = [true, 2, "Hello", [1, 2, 3], {one: "one", two: "two"},
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
    describe("#isSet", function () {
        it("should be aliased with 'exists'", function () {
            var valueObj = value(null);

            _expect(valueObj.isSet).to.be(valueObj.exists);
        });
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
    describe("#isNotSet", function () {
        it("should be aliased with 'doesNotExist'", function () {
            var valueObj = value(null);

            _expect(valueObj.isNotSet).to.be(valueObj.doesNotExist);
        });
        // We're assuming that the negation works when this test runs
        it("should return true when the value is null", function () {
            _expect(value(null).isNotSet()).to.be(true);
        });
    });
    describe("#isInstanceOf", function () {
        function A() {}

        function B() {}

        function C() {}
        C.prototype = A.prototype;

        function D() {}
        D.Extends = A;

        // Here we've got an inconsitent inheritance: E has an "Extends"-property
        // which points to A AND has B.prototype as its prototype.
        //
        // In this case the prototype should take precedence over Extends.
        // Actually it's not possible the other way round, because checking for
        // e.constructor to get the Extends-prototype does not return E. Instead
        // of it returns the prototype of E, which is B.prototype
        function E() {}
        E.Extends = A;
        E.prototype = B.prototype;

        // Inheriting from a native function
        function MyNativeExtension() {}

        it("should be aliased with 'isA', 'isAn', 'isTypeOf'", function () {
            var valueObj = value(null);

            _expect(valueObj.isA).to.be(valueObj.isInstanceOf);
            _expect(valueObj.isAn).to.be(valueObj.isInstanceOf);
            _expect(valueObj.isTypeOf).to.be(valueObj.isInstanceOf);
        });
        it("should work with built-in values", function () {
            var builtInValues = [true, 2, "Hello", [1, 2, 3], {one: "one", two: "two"},
                    new Date(), /hello/gi, new Error()];

            builtInValues.forEach(function (builtIn, index) {
                 _expect(value(builtIn).isInstanceOf(builtInConstructors[index])).to.be(true);
            });

            if (typeof window !== "undefined") {
                _expect(value(document.createElement("a")).isInstanceOf(HTMLAnchorElement)).to.be(true);
            }
        });
        it("should treat all set values as objects", function () {
            _expect(value(true).isInstanceOf(Object)).to.be(true);
            _expect(value(2).isInstanceOf(Object)).to.be(true);
            _expect(value("hello").isInstanceOf(Object)).to.be(true);
            _expect(value("").isInstanceOf(Object)).to.be(true);
            _expect(value([1, 2, 3]).isInstanceOf(Object)).to.be(true);
        });
        it("should treat null and undefined as non-objects", function () {
            _expect(value(null).isInstanceOf(Object)).to.be(false);
            _expect(value(undefined).isInstanceOf(Object)).to.be(false);
        });
        it("should not work with arguments when testing for an Array", function () {
            _expect(value(arguments).isInstanceOf(Array)).to.be(false);
        });
        it("should work with prototype inheritance", function () {
            var c = new C(),
                valueC = value(c);

            _expect(valueC.isInstanceOf(A)).to.be(true);
            _expect(valueC.isInstanceOf(C)).to.be(true);
        });
        it("should return true when the object exposes an 'Extends'-property", function () {
            var d = new D(),
                valueD = value(d);

            _expect(valueD.isInstanceOf(A)).to.be(true);
            _expect(valueD.isInstanceOf(D)).to.be(true);
        });
        it("Prototype-inheritance should take precedence over Extends-property in a conflicting inheritance case", function () {
            var e = new E(),
                valueE = value(e);

            _expect(valueE.isInstanceOf(B)).to.be(true);
            _expect(valueE.isInstanceOf(E)).to.be(true);
            _expect(valueE.isInstanceOf(A)).to.be(false);
        });
        it("should return true when inheriting from built-in constructors", function () {
            var myNativeExtension,
                originalPrototype = MyNativeExtension.prototype;

            builtInConstructors.forEach(function (BuiltInConstructor, index) {
                MyNativeExtension.Extends = BuiltInConstructor;
                myNativeExtension = new MyNativeExtension();
                _expect(value(myNativeExtension).isInstanceOf(BuiltInConstructor)).to.be(true);
                delete MyNativeExtension.Extends;

                MyNativeExtension.prototype = builtInConstructors[index].prototype;
                myNativeExtension = new MyNativeExtension();
                _expect(value(myNativeExtension).isInstanceOf(BuiltInConstructor)).to.be(true);

                MyNativeExtension.prototype = originalPrototype;
            });
        });
        it("should return false when the prototypes are not inheriting", function () {
            var c = new C(),
                valueC = value(c);

            _expect(valueC.isInstanceOf(B)).to.be(false);
        });
        it("should return false when the object exposes an unfitting Extends property", function () {
            var d = new D(),
                valueD = value(d);

            _expect(valueD.isInstanceOf(B)).to.be(false);
        });
        it("should return false when you check an undefined or null value", function () {
            _expect(value(null).isInstanceOf(B)).to.be(false);
            _expect(value(undefined).isInstanceOf(B)).to.be(false);
        });
        it("should return false for NaN and Infinity when checking for Number", function () {
            _expect(value(NaN).isInstanceOf(Number)).to.be(false);
            _expect(value(Infinity).isInstanceOf(Number)).to.be(false);
        });
        it("should throw an exception when passing a non-function", function () {
            var somethingIs = value("this value doesn't matter");

            _expect(
                function () {
                    somethingIs.isInstanceOf(undefined);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.isInstanceOf(null);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.isInstanceOf(false);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.isInstanceOf(2);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.isInstanceOf("hello");
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.isInstanceOf([1, 2, 3]);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.isInstanceOf({one: 1, two: 2, three: 3});
                }).to.throwException();
        });
    });
    describe("#isNotInstanceOf", function () {
        it("should be aliased with 'isNotA', 'isNotAn', 'isNotTypeOf'", function () {
            var valueObj = value(null);

            _expect(valueObj.isNotA).to.be(valueObj.isNotInstanceOf);
            _expect(valueObj.isNotAn).to.be(valueObj.isNotInstanceOf);
            _expect(valueObj.isNotTypeOf).to.be(valueObj.isNotInstanceOf);
        });
        // We're assuming that the negation works when this test runs
        it("should work with built-in values", function () {
            _expect(value("hello").isNotInstanceOf(String)).to.be(false);
        });
    });
    //TODO Maybe I'll remove this method
/*    describe("#implements", function () {
        var MyInterface = {},
            OtherInterface = {};

        function MyClass() {}

        MyClass.Implements = [MyInterface];

        it("should be aliased with 'provides'", function () {
            var valueObj = value(null);

            _expect(valueObj.provides).to.be(valueObj.implements);
        });
        it("should return true when the Implements-array contains the Interface", function () {
            _expect(value(new MyClass()).implements(MyInterface)).to.be(true);
        });
        it("should return false when the Implements-array does not contain the Interface", function () {
            _expect(value(new MyClass()).implements(OtherInterface)).to.be(false);
        });
        it("should return false when the subject is null or undefined", function () {
            _expect(value(null).implements(OtherInterface)).to.be(false);
            _expect(value(undefined).implements(OtherInterface)).to.be(false);
        });
        it("should throw an exception when passing a non-object", function () {
            var somethingIs = value("this value doesn't matter");

            _expect(
                function () {
                    somethingIs.implements(undefined);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.implements(null);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.implements(false);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.implements(2);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.implements("hello");
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.implements([1, 2, 3]);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.implements(function () {
                    });
                }).to.throwException();
        });
    });
    describe("#doesNotImplement", function () {
        var MyInterface = {},
            OtherInterface = {};

        function MyClass() {}

        MyClass.Implements = [MyInterface];

        it("should be aliased with 'doesNotProvide'", function () {
            var valueObj = value(null);

            _expect(valueObj.doesNotProvide).to.be(valueObj.doesNotImplement);
        });
        it("should return true when the Implements-array contains the Interface", function () {
            _expect(value(new MyClass()).doesNotImplement(MyInterface)).to.be(false);
        });
        it("should return false when the Implements-array does not contain the Interface", function () {
            _expect(value(new MyClass()).doesNotImplement(OtherInterface)).to.be(true);
        });
        it("should return false when the subject is null or undefined", function () {
            _expect(value(null).doesNotImplement(OtherInterface)).to.be(true);
            _expect(value(undefined).doesNotImplement(OtherInterface)).to.be(true);
        });
        it("should throw an exception when passing a non-object", function () {
            var somethingIs = value("this value doesn't matter");

            _expect(
                function () {
                    somethingIs.doesNotImplement(undefined);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.doesNotImplement(null);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.doesNotImplement(false);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.doesNotImplement(2);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.doesNotImplement("hello");
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.doesNotImplement([1, 2, 3]);
                }).to.throwException();
            _expect(
                function () {
                    somethingIs.doesNotImplement(function () {
                    });
                }).to.throwException();
        });
    });*/
});

