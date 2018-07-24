
  

# React-ioc

  

  

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) ![npm (scoped)](https://img.shields.io/npm/v/@cycle/core.svg)

  

  

## About

  

React-ioc is an implementation of [InversifyJS](https://github.com/inversify/InversifyJS) for react applications.

  

It uses Context Api of React 16 to manage containers.

  

  

## Features

  

- Supports Hierarchical Dependency Injection.

  

- Easy Api that supports Singleton pattern and Transient pattern.

  

- Support for decorator and JSX based injection.

  

- Automatic cleaning of injected properties on unmounting of React components.

  

- Written with typescript i.e. has typings.

  

  

## Installation

  

`npm i @servicetitan/react-ioc`

  

  

## Documentation

  

*  [Inject](#Inject)

  

*  [Injectable](#Injectable)

  

*  [Container](#Container)

  

*  [ContainerContext](#ContainerContext)

  

*  [Provide](#Provide)

  

*  [WithContainer](#WithContainer)

  

*  [Provider](#Provider)

  

*  [InjectDependency](#InjectDependency)

  

  

#### <a name="Inject"></a> @inject

  

Alias for [@inject](https://github.com/inversify/InversifyJS#step-2-declare-dependencies-using-the-injectable--inject-decorators) from InversifyJS.

  

  

#### <a name="Injectable"></a> @injectable

  

Alias for [@injectable](https://github.com/inversify/InversifyJS#step-2-declare-dependencies-using-the-injectable--inject-decorators) from InversifyJS.

  

  

#### <a name="Container"></a> Container

  

Alias for [Container](https://github.com/inversify/InversifyJS/blob/master/wiki/container_api.md) from InversifyJS.

  

  

#### <a name="ContainerContext"></a> ContainerContext

  

A { provider, consumer } pair generated by `React.createContext`

  

  

#### <a name="Provide"></a> @provide

  

A decorator used to inject the required information in the Provider in the current level of hierarchy.

  

`[NOTE: Must use @withContainer with it.]`

  

  

#### <a name="WithContainer"></a> @withContainer

  

A decorator 

  

  

### <a name="Provider"></a> provider

  

A React SFC equivalent to [@provide](#Provide)

  
  

# Examples

- Store

  

```
import { injectable } from '@servicetitan/react-ioc';

@injectable()
export class MySpecialStore {
	public mySpecialValue: string;
	constructor() {
		this.mySpecialValue = 'My Special Text';
	}
}
```

  

- Providing Container with `@provide` to a component

  

```
import {provide, withContainer, injectDependency} from '@servicetitan/react-ioc';

@provide({
	singletons: [MySpecialStore]
})
class MySpecialComponent extends React.Component {
	@injectDependency(MySpecialStore)
	public mySpecialStore: MySpecialStore;
}
```

- Providing container with `<Provider>`

```
    <Provider singletons={[MySpecialStore]}>
        <MySpecialComponent />
    </Provider>
```

* Any child component can inject `MySpecialStore` with following syntax without using `@provide`

```
class MySpecialSubComponent extends React.Component {
	@injectDependency(MySpecialStore)
	public mySpecialStore: MySpecialStore;
}
```

* For a non react component, we can inject values with `@inject` inside the container. Like:

```
class MySpecialConsumerStore {
    private mySpecialStore: MySpecialStore;

    constructore(@inject(MySpecialStore) mySpecialStore: MySpecialStore) {
        this.mySpecialStore = mySpecialStore;
    }
}
```

* Accessing container inside React SFC.

```
const MySpecialSFC = () => (
    <ContainerContext.Consumer>
    {
        container => (
            <div>
                {container.get(PasswordResetStore).mySpecialValue}
            </div>
        )
    }
    </ContainerContext.Consumer>
);
```

