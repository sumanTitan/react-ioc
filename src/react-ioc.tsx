import * as React from 'react';
import { Container, interfaces } from 'inversify';
import 'reflect-metadata';

export { interfaces };

export const rootContainer = new Container();

export const ContainerContext = React.createContext(rootContainer);

export type Newable = {
    new (...args: any[]): any;
};

export interface ProviderInterface {
    singletons?: Newable[];
    instances?: Newable[];
}

export interface ProviderComponentInterface extends ProviderInterface {
    parentContainer: Container;
}

type WrappedComponent<P> = {
    wrappedComponent: ReactComponent<P>
    wrappedInstance: React.ReactInstance | undefined
};

type ReactComponent<P = any> =
    React.StatelessComponent<P>
    | React.ComponentClass<P>
    | React.ClassicComponentClass<P>;

type ProvideDecorator = (
    stores: ProviderInterface
) => <T extends ReactComponent>(target: T) => T & WrappedComponent<T>;

export const provide = ((stores) => {
    return (Component: ReactComponent) => {
        return props => (
            <ContainerContext.Consumer>
                {
                    container => (
                        <ProviderComponent {...stores} parentContainer={container}>
                            <Component {...props} />
                        </ProviderComponent>
                    )
                }
            </ContainerContext.Consumer>
        );
    };
}) as ProvideDecorator;

type WithContainer = <T extends ReactComponent>(target: T) => T & WrappedComponent<T>;

export const withContainer = ((Component: ReactComponent) => {
    return props => (
        <ContainerContext.Consumer>
            {container => <Component {...props} container={container} />}
        </ContainerContext.Consumer>
    );
}) as WithContainer;

export const Provider = (props: ProviderInterface & { children?: React.ReactNode; }) => (
    <ContainerContext.Consumer>
        {
            container => (
                <ProviderComponent {...props} parentContainer={container}>
                    {props.children}
                </ProviderComponent>
            )
        }
    </ContainerContext.Consumer>
);

class ProviderComponent 
    extends React.Component<ProviderComponentInterface> {
    private container: Container;
    constructor(props: ProviderComponentInterface) {
        super(props);
        this.container = new Container();
        this.container.parent = this.props.parentContainer;
        if (this.props.singletons) {
            this.props.singletons.forEach((store) => {
                this.container.bind(store).to(store).inSingletonScope();
            });
        }
        if (this.props.instances) {
            this.props.instances.forEach((store) => {
                this.container.bind(store).to(store);
            });
        }
    }

    componentWillUnmount() {
        if (this.props.singletons) {
            this.props.singletons.forEach((store) => {
                this.container.unbind(store);
            });
        }
        if (this.props.instances) {
            this.props.instances.forEach((store) => {
                this.container.unbind(store);
            });
        }
    }

    render() {
        return (
            <ContainerContext.Provider value={this.container}>
                {this.props.children}
            </ContainerContext.Provider>
        );
    }
}

const INJECTION = Symbol.for('INJECTION');

function proxyGetter(
    proto: any,
    key: string,
    resolve: (componentInstance: any) => any,
    doCache: boolean
) {
    function getter(this: any) {
        if (doCache && !Reflect.hasMetadata(INJECTION, this, key)) {
            Reflect.defineMetadata(INJECTION, resolve(this), this, key);
        }
        if (Reflect.hasMetadata(INJECTION, this, key)) {
            return Reflect.getMetadata(INJECTION, this, key);
        } else {
            return resolve(this);
        }
    }
    function setter(this: any, newVal: any) {
        Reflect.defineMetadata(INJECTION, newVal, this, key);
    }
    Object.defineProperty(proto, key, {
        configurable: true,
        enumerable: true,
        get: getter,
        set: setter
    });
}

export function injectDependency(serviceIdentifier: interfaces.ServiceIdentifier<any>) {
    return function (proto: any, key: string): void {
        const resolve = (componentInstance: any) => {
            return componentInstance.props.container.get(serviceIdentifier);
        };
        proxyGetter(proto, key, resolve, true);
    };
}

