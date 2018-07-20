var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as React from 'react';
import { Container } from 'inversify';
import 'reflect-metadata';
export var rootContainer = new Container();
export var ContainerContext = React.createContext(rootContainer);
export var provide = (function (stores) {
    return function (Component) {
        return function (props) { return (React.createElement(ContainerContext.Consumer, null, function (container) { return (React.createElement(ProviderComponent, __assign({}, stores, { parentContainer: container }),
            React.createElement(Component, __assign({}, props)))); })); };
    };
});
export var withContainer = (function (Component) {
    return function (props) { return (React.createElement(ContainerContext.Consumer, null, function (container) { return React.createElement(Component, __assign({}, props, { container: container })); })); };
});
export var Provider = function (props) { return (React.createElement(ContainerContext.Consumer, null, function (container) { return (React.createElement(ProviderComponent, __assign({}, props, { parentContainer: container }), props.children)); })); };
var ProviderComponent = /** @class */ (function (_super) {
    __extends(ProviderComponent, _super);
    function ProviderComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.container = new Container();
        _this.container.parent = _this.props.parentContainer;
        if (_this.props.singletons) {
            _this.props.singletons.forEach(function (store) {
                _this.container.bind(store).to(store).inSingletonScope();
            });
        }
        if (_this.props.instances) {
            _this.props.instances.forEach(function (store) {
                _this.container.bind(store).to(store);
            });
        }
        return _this;
    }
    ProviderComponent.prototype.componentWillUnmount = function () {
        var _this = this;
        if (this.props.singletons) {
            this.props.singletons.forEach(function (store) {
                _this.container.unbind(store);
            });
        }
        if (this.props.instances) {
            this.props.instances.forEach(function (store) {
                _this.container.unbind(store);
            });
        }
    };
    ProviderComponent.prototype.render = function () {
        return (React.createElement(ContainerContext.Provider, { value: this.container }, this.props.children));
    };
    return ProviderComponent;
}(React.Component));
var INJECTION = Symbol.for('INJECTION');
function proxyGetter(proto, key, resolve, doCache) {
    function getter() {
        if (doCache && !Reflect.hasMetadata(INJECTION, this, key)) {
            Reflect.defineMetadata(INJECTION, resolve(this), this, key);
        }
        if (Reflect.hasMetadata(INJECTION, this, key)) {
            return Reflect.getMetadata(INJECTION, this, key);
        }
        else {
            return resolve(this);
        }
    }
    function setter(newVal) {
        Reflect.defineMetadata(INJECTION, newVal, this, key);
    }
    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter
    });
}
export function injectDependency(serviceIdentifier) {
    return function (proto, key) {
        var resolve = function (componentInstance) {
            return componentInstance.props.container.get(serviceIdentifier);
        };
        proxyGetter(proto, key, resolve, true);
    };
}
//# sourceMappingURL=react-ioc.js.map