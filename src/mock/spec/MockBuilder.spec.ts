import Spy = jasmine.Spy;
import {Foo} from "./testClass/Foo";
import {Mock} from "../Mock";
import {IFoo} from "./testClass/IFoo";
import {MockBuilder} from "../MockBuilder";
import {ConstructorArguments} from "../ConstructorArguments";
import {INoConstructor} from "./testClass/INoConstructor";
import {Bar} from "./testClass/Bar";
import {Baz} from "./testClass/Baz";
import {NoConstructor} from "./testClass/NoConstructor";
import {IBar} from "./testClass/IBar";

describe("Mockbuilder: on creating a builder", () => {
    describe("with instance constructor flag: false (default)", () => {
        it("can create a mock without calling the instance constructor", () => {
            const SpiedOnFoo: Spy = jasmine.createSpy("Foo").and.callFake(Foo);

            const mockFoo: Mock<IFoo> = new MockBuilder<IFoo>().createInstance(SpiedOnFoo);
            expect(mockFoo.instance).toBeDefined();

            expect(SpiedOnFoo).not.toHaveBeenCalled();

            expect(mockFoo.instance.stringVal).toBeUndefined();
            expect(mockFoo.instance.booleanVal).toBeUndefined();
            expect(mockFoo.instance.numberVal).toBeUndefined();
        });

        it("does not set the properties from the constructorArgs", () => {
            const mockFoo: Mock<IFoo> = new MockBuilder<IFoo>()
                .createInstance(Foo, new ConstructorArguments()
                    .map("stringVal", "str_val")
                    .map("booleanVal", true)
                    .map("numberVal", 169));

            expect(mockFoo.instance).toBeDefined();
            expect(mockFoo.instance.stringVal).toBeUndefined();
            expect(mockFoo.instance.booleanVal).toBeUndefined();
            expect(mockFoo.instance.numberVal).toBeUndefined();
        });

        it("can create a mock with overriden attributes", () => {
            const mock: Mock<IFoo> = new MockBuilder<IFoo>()
                .createInstance(Foo)
                .mapProperty("stringVal", "str_val")
                .mapProperty("booleanVal", true)
                .mapProperty("numberVal", 169);

            expect(mock.instance.stringVal).toBe("str_val");
            expect(mock.instance.booleanVal).toBe(true);
            expect(mock.instance.numberVal).toBe(169);
        });
    });

    describe("with instance constructor flag: true", () => {
        it("calls the instance constructor", () => {
            const SpiesOnFoo: Spy = jasmine.createSpy("Foo").and.callFake(Foo);

            const mockFoo: Mock<IFoo> = new MockBuilder<IFoo>(true).createInstance(SpiesOnFoo);
            expect(mockFoo.instance).toBeDefined();

            expect(SpiesOnFoo).toHaveBeenCalled();
        });

        it("calls the instance constructor using the builder-notation", () => {
            const SpiesOnFoo: Spy = jasmine.createSpy("Foo").and.callFake(Foo);

            const mockFoo: Mock<IFoo> = new MockBuilder<IFoo>()
                .withCallConstructor(true)
                .createInstance(SpiesOnFoo);
            expect(mockFoo.instance).toBeDefined();

            expect(SpiesOnFoo).toHaveBeenCalled();
        });
    });
});

describe("MockBuilder", () => {
    var mock: Mock<IFoo>;
    var inheritedMock: Mock<IFoo>;
    var mockWithoutArguments: Mock<INoConstructor>;
    var constructorArguments: ConstructorArguments;
    beforeEach(() => {
        constructorArguments = new ConstructorArguments()
            .map("stringVal", "just a str")
            .map("booleanVal", true)
            .map("barVal", new Bar());
        mock = new MockBuilder<IFoo>(true).createInstance(Foo, constructorArguments);
        inheritedMock = new MockBuilder<IFoo>(true).createInstance(Baz, constructorArguments);
        mockWithoutArguments = new MockBuilder<INoConstructor>(true).createInstance(NoConstructor);
    });

    describe("for normal objects", () => {
        describe("on createIntance(), the mocked object", () => {
            it("should return a mock object", () => {
                expect(mock.hasOwnProperty("instance")).toBe(true);
                expect(mock.hasOwnProperty("instance")).toBe(true);
            });
            it("should have all the functions defined", () => {
                expect(mock.instance.foo).toBeDefined();
                expect(mock.instance.bar).toBeDefined();
                expect(mock.instance.baz).toBeDefined();
            });
            it("should have created spies for every function", () => {
                expect((<Spy>mock.instance.foo).and).toBeDefined();
                expect((<Spy>mock.instance.bar).and).toBeDefined();
                expect((<Spy>mock.instance.baz).and).toBeDefined();
            });
            it("should have all the properties defined", () => {
                expect(mock.instance.hasOwnProperty("stringVal")).toBe(true);
                expect(mock.instance.hasOwnProperty("booleanVal")).toBe(true);
                expect(mock.instance.hasOwnProperty("numberVal")).toBe(true);
                expect(mock.instance.hasOwnProperty("objectVal")).toBe(true);

            });
            it("should have reset all the properties with default values except the ones provided in the constructor", () => {
                expect(mock.instance.stringVal).toEqual(constructorArguments.arguments.stringVal);
                expect(mock.instance.booleanVal).toEqual(constructorArguments.arguments.booleanVal);
                expect(mock.instance.numberVal).toEqual(0);
                expect(mock.instance.objectVal).toEqual({});
                expect(mock.instance.barVal).toEqual(constructorArguments.arguments.barVal);
            });
        });
        describe("on mapProperty() on the mock object", () => {
            it("should return the mock object", () => {
                var returnVal: any = mock.mapProperty("numberVal", 100);
                expect(returnVal.hasOwnProperty("instance")).toBe(true);
            });
            it("should map the property on the stubbed object", () => {
                var barVal: IBar = new Bar();
                mock.mapProperty("numberVal", 100)
                    .mapProperty("booleanVal", true)
                    .mapProperty("stringVal", "dummystr")
                    .mapProperty("barVal", barVal);
                expect(mock.instance.numberVal).toBe(100);
                expect(mock.instance.booleanVal).toBe(true);
                expect(mock.instance.stringVal).toBe("dummystr");
                expect(mock.instance.barVal).toBe(barVal);
            });
        });
        describe("on setupMethod() on the mock object", () => {
            it("should return a stubbedFunc method for that method", () => {
                expect(mock.setupMethod("bar").andReturn).toBeDefined();
            });
            describe("on andReturn() on the stubbedFunc method", () => {
                it("should cast the function to a spy and map the passed return value on it", () => {
                    mock.setupMethod("bar")
                        .andReturn("dummyValue")
                        .setupMethod("baz")
                        .andReturn(100);
                    expect(mock.instance.bar()).toBe("dummyValue");
                    expect(mock.instance.baz()).toBe(100);
                });
                it("should return the mock object", () => {
                    var returnObj: any = mock.setupMethod("bar")
                                             .andReturn("dummyValue")
                                             .setupMethod("baz")
                                             .andReturn(100);
                    expect(returnObj.hasOwnProperty("instance")).toBe(true);
                });
            });
            describe("on andCallFake() on the stubbedFunc method", () => {
                it("should cast the function to a spy and call the passed value ", () => {
                    const spyFunction: Spy = jasmine.createSpy("spiedFunction");

                    mock.setupMethod("bar").andCallFake(spyFunction);
                    mock.instance.bar();
                    expect(spyFunction).toHaveBeenCalled();
                });
                it("should propagate all method arguments to the replacementFunction", () => {
                    const spyFunction: Spy = jasmine.createSpy("spiedFunction");
                    const args: Array<String> = ["i", "am", "an", "argument", "list"];

                    mock.setupMethod("quux").andCallFake(spyFunction);
                    mock.instance.quux(args);
                    expect(spyFunction).toHaveBeenCalledWith(args);
                });
            });
            describe("on getSpy()", () => {
                it("should return the spy of the method", () => {
                    var spy: Spy = mock
                        .setupMethod("bar")
                        .getSpy();
                    expect(spy.and).toBeDefined();
                });
            });
        });
    });
    describe("for inherited objects", () => {
        describe("on createIntance(), the mocked object", () => {
            it("should return a mock object", () => {
                expect(inheritedMock.hasOwnProperty("instance")).toBe(true);
                expect(inheritedMock.hasOwnProperty("instance")).toBe(true);
            });
            it("should have all the functions defined", () => {
                expect(inheritedMock.instance.foo).toBeDefined();
                expect(inheritedMock.instance.bar).toBeDefined();
                expect(inheritedMock.instance.baz).toBeDefined();
            });
            it("should have created spies for every function", () => {
                expect((<Spy>inheritedMock.instance.foo).and).toBeDefined();
                expect((<Spy>inheritedMock.instance.bar).and).toBeDefined();
                expect((<Spy>inheritedMock.instance.baz).and).toBeDefined();
            });
            it("should have all the properties defined", () => {
                expect(inheritedMock.instance.hasOwnProperty("stringVal")).toBe(true);
                expect(inheritedMock.instance.hasOwnProperty("booleanVal")).toBe(true);
                expect(inheritedMock.instance.hasOwnProperty("numberVal")).toBe(true);
                expect(inheritedMock.instance.hasOwnProperty("objectVal")).toBe(true);

            });
            it("should have reset all the properties with default values", () => {
                expect(inheritedMock.instance.stringVal).toEqual(constructorArguments.arguments.stringVal);
                expect(inheritedMock.instance.booleanVal).toEqual(constructorArguments.arguments.booleanVal);
                expect(inheritedMock.instance.numberVal).toEqual(0);
                expect(inheritedMock.instance.objectVal).toEqual({});
                expect(inheritedMock.instance.barVal).toEqual(constructorArguments.arguments.barVal);
            });
        });
        describe("on mapProperty() on the mock object", () => {
            it("should return the mock object", () => {
                var returnVal: any = inheritedMock.mapProperty("numberVal", 100);
                expect(returnVal.hasOwnProperty("instance")).toBe(true);
            });
            it("should map the property on the stubbed object", () => {
                var barVal: IBar = new Bar();
                inheritedMock.mapProperty("numberVal", 100)
                             .mapProperty("booleanVal", true)
                             .mapProperty("stringVal", "dummystr")
                             .mapProperty("barVal", barVal);
                expect(inheritedMock.instance.numberVal).toBe(100);
                expect(inheritedMock.instance.booleanVal).toBe(true);
                expect(inheritedMock.instance.stringVal).toBe("dummystr");
                expect(inheritedMock.instance.barVal).toBe(barVal);
            });
        });
        describe("on setupMethod() on the mock object", () => {
            it("should return a stubbedFunc method for that method", () => {
                expect(inheritedMock.setupMethod("bar").andReturn).toBeDefined();
            });
            describe("on andReturn() on the stubbedFunc method", () => {
                it("should cast the function to a spy and map the passed return value on it", () => {
                    inheritedMock.setupMethod("bar")
                                 .andReturn("dummyValue")
                                 .setupMethod("baz")
                                 .andReturn(100);
                    expect(inheritedMock.instance.bar()).toBe("dummyValue");
                    expect(inheritedMock.instance.baz()).toBe(100);
                });
                it("should return the mock object", () => {
                    var returnObj: any = inheritedMock.setupMethod("bar")
                                                      .andReturn("dummyValue")
                                                      .setupMethod("baz")
                                                      .andReturn(100);
                    expect(returnObj.hasOwnProperty("instance")).toBe(true);
                });
            });
            describe("on getSpy()", () => {
                it("should return the spy of the method", () => {
                    var spy: Spy = inheritedMock
                        .setupMethod("bar")
                        .getSpy();
                    expect(spy.and).toBeDefined();
                });
            });
        });
    });
    describe("for objects without constructor options", () => {
        describe("on createIntance(), the mocked object", () => {
            it("should return a mock object", () => {
                expect(mockWithoutArguments.hasOwnProperty("instance")).toBe(true);
                expect(mockWithoutArguments.hasOwnProperty("instance")).toBe(true);
            });
            it("should have all the functions defined", () => {
                expect(mockWithoutArguments.instance.foo).toBeDefined();
                expect(mockWithoutArguments.instance.bar).toBeDefined();
                expect(mockWithoutArguments.instance.baz).toBeDefined();
            });
            it("should have created spies for every function", () => {
                expect((<Spy>mockWithoutArguments.instance.foo).and).toBeDefined();
                expect((<Spy>mockWithoutArguments.instance.bar).and).toBeDefined();
                expect((<Spy>mockWithoutArguments.instance.baz).and).toBeDefined();
            });
            it("should have all the properties defined", () => {
                expect(mockWithoutArguments.instance.hasOwnProperty("stringVal")).toBe(true);
                expect(mockWithoutArguments.instance.hasOwnProperty("booleanVal")).toBe(true);
                expect(mockWithoutArguments.instance.hasOwnProperty("numberVal")).toBe(true);
                expect(mockWithoutArguments.instance.hasOwnProperty("objectVal")).toBe(true);

            });
            it("should have reset all the properties with default values", () => {
                expect(mockWithoutArguments.instance.stringVal).toEqual("");
                expect(mockWithoutArguments.instance.booleanVal).toEqual(false);
                expect(mockWithoutArguments.instance.numberVal).toEqual(0);
                expect(mockWithoutArguments.instance.objectVal).toEqual({});
            });
        });
        describe("on mapProperty() on the mock object", () => {
            it("should return the mock object", () => {
                var returnVal: any = mockWithoutArguments.mapProperty("numberVal", 100);
                expect(returnVal.hasOwnProperty("instance")).toBe(true);
            });
            it("should map the property on the stubbed object", () => {
                var barVal: IBar = new Bar();
                mockWithoutArguments.mapProperty("numberVal", 100)
                                    .mapProperty("booleanVal", true)
                                    .mapProperty("stringVal", "dummystr")
                                    .mapProperty("barVal", barVal);
                expect(mockWithoutArguments.instance.numberVal).toBe(100);
                expect(mockWithoutArguments.instance.booleanVal).toBe(true);
                expect(mockWithoutArguments.instance.stringVal).toBe("dummystr");
            });
        });
        describe("on setupMethod() on the mock object", () => {
            it("should return a stubbedFunc method for that method", () => {
                expect(mockWithoutArguments.setupMethod("bar").andReturn).toBeDefined();
            });
            describe("on andReturn() on the stubbedFunc method", () => {
                it("should cast the function to a spy and map the passed return value on it", () => {
                    mockWithoutArguments.setupMethod("bar")
                                        .andReturn("dummyValue")
                                        .setupMethod("baz")
                                        .andReturn(100);
                    expect(mockWithoutArguments.instance.bar()).toBe("dummyValue");
                    expect(mockWithoutArguments.instance.baz()).toBe(100);
                });
                it("should return the mock object", () => {
                    var returnObj: any = mockWithoutArguments.setupMethod("bar")
                                                             .andReturn("dummyValue")
                                                             .setupMethod("baz")
                                                             .andReturn(100);
                    expect(returnObj.hasOwnProperty("instance")).toBe(true);
                });
            });
            describe("on getSpy()", () => {
                it("should return the spy of the method", () => {
                    var spy: Spy = mockWithoutArguments
                        .setupMethod("bar")
                        .getSpy();
                    expect(spy.and).toBeDefined();
                });
            });
        });
    });
});

describe("MockBuilder: original context sanity check", () => {
    it("can create a mock", () => {
        const bar1: Bar = new Bar();
        expect(bar1.bar()).toBe("just a string");

        const barMock: Mock<IBar> = new MockBuilder<IBar>().createInstance(Bar);
        expect(barMock.instance.bar()).toBe(undefined);

        const bar2: Bar = new Bar();
        expect(bar2.bar()).toBe("just a string");
    });

    it("can create a mock with a spied method", () => {
        const bar1: Bar = new Bar();
        expect(bar1.bar()).toBe("just a string");

        const barMock: Mock<IBar> = new MockBuilder<IBar>()
            .createInstance(Bar)
            .setupMethod("bar").andReturn("spied!");

        expect(barMock.instance.bar()).toBe("spied!");

        const bar2: Bar = new Bar();
        expect(bar2.bar()).toBe("just a string");
    });
});
