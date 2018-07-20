import * as React from 'react';
import { Container, interfaces } from 'inversify';
import 'reflect-metadata';
export { interfaces };
export declare const rootContainer: Container;
export declare const ContainerContext: React.Context<Container>;
export declare type Newable = {
    new (...args: any[]): any;
};
export interface ProviderInterface {
    singletons?: Newable[];
    instances?: Newable[];
}
export interface ProviderComponentInterface extends ProviderInterface {
    parentContainer: Container;
}
declare type WrappedComponent<P> = {
    wrappedComponent: ReactComponent<P>;
    wrappedInstance: React.ReactInstance | undefined;
};
declare type ReactComponent<P = any> = React.StatelessComponent<P> | React.ComponentClass<P> | React.ClassicComponentClass<P>;
declare type ProvideDecorator = (stores: ProviderInterface) => <T extends ReactComponent>(target: T) => T & WrappedComponent<T>;
export declare const provide: ProvideDecorator;
declare type WithContainer = <T extends ReactComponent>(target: T) => T & WrappedComponent<T>;
export declare const withContainer: WithContainer;
export declare const Provider: (props: ProviderInterface & {
    children?: React.ReactNode;
}) => JSX.Element;
export declare function injectDependency(serviceIdentifier: interfaces.ServiceIdentifier<any>): (proto: any, key: string) => void;
