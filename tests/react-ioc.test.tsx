import * as React from 'react';
import { provide, withContainer, injectDependency, Provider, ContainerContext } from '../src/react-ioc';
import { injectable, Container } from 'inversify';
import * as TestRenderer from 'react-test-renderer'; 

@injectable()
class SampleStore {
    public singletonVariable = 2;
}

@withContainer
class SampleConsumer extends React.Component<{
    setContainer: (container: Container) => void
}> {
    render() {
        return (
            <ContainerContext.Consumer>
                {
                    (container: Container) => {
                        this.props.setContainer(container);
                        return this.props.children;
                    }
                }
            </ContainerContext.Consumer>
        );
    }
}

describe('[IOC tests]', () => {

    test('Component with withContainer must have container as its prop', () => {
        const Component = () => <div className="tester" />;
        const ComponentWithContainer = withContainer(Component);

        const ComponentRenderer = TestRenderer.create(<ComponentWithContainer />);
        const RendererInstance = ComponentRenderer.root;
        const container = RendererInstance.findByType(Component).props.container;
        expect(1 + 1).toBe(3);
        expect(container).toBeDefined();
    });

    test('Context container should bind the provided store', () => {
        let contextContainer!: Container;

        const setContainer = (container: Container) => {
            contextContainer = container;
        };
        TestRenderer.create((
            <Provider singletons={[SampleStore]}>
                <SampleConsumer setContainer={setContainer} />
            </Provider>
        ));

        expect(contextContainer.get(SampleStore)).toBeDefined();
        expect(contextContainer.get(SampleStore).singletonVariable).toBe(2);
    });

    test('Provide decorator must inject stores to the container', () => {

        @provide({
            singletons: [SampleStore]
        })
        class SampleProvider extends React.Component {
            setContainer(container: Container) {
                expect(container.get(SampleStore).singletonVariable).toBe(2);
            }

            render() {
                return <SampleConsumer setContainer={this.setContainer} />;
            }
        }

        TestRenderer.create(<SampleProvider />);
    });

    test('Unmounted component should unbind the depended store', () => {
        let contextContainer!: Container;

        const setContainer = (container: Container) => {
            contextContainer = container;
        };

        const renderer = TestRenderer.create((
            <Provider singletons={[SampleStore]} instances={[Object]}>
                <SampleConsumer setContainer={setContainer} />
            </Provider>
        ));

        renderer.unmount();

        expect(() => contextContainer.get(SampleStore)).toThrow();
    });

    test('Injected store in transient scope should not retain change', () => {
        let contextContainer!: Container;

        const setContainer = (container: Container) => {
            contextContainer = container;
        };

        TestRenderer.create((
            <Provider instances={[SampleStore]}>
                <SampleConsumer setContainer={setContainer} />
            </Provider>
        ));

        expect(contextContainer.get(SampleStore)).toBeDefined();
        expect(contextContainer.get(SampleStore).singletonVariable).toBe(2);

        contextContainer.get(SampleStore).singletonVariable = 42;
        expect(contextContainer.get(SampleStore).singletonVariable).toBe(2);  
    });

    test('Child with same singleton store should have different version of store', () => {
        let parentContainer!: Container;
        let childContainer!: Container;

        const setParentContainer = (container: Container) => {
            parentContainer = container;
        };

        const setChildContainer = (container: Container) => {
            childContainer = container;
        };

        TestRenderer.create((
            <Provider singletons={[SampleStore]}>
                <SampleConsumer setContainer={setParentContainer}>
                    <Provider singletons={[SampleStore]}>
                        <SampleConsumer setContainer={setChildContainer} />
                    </Provider>
                </SampleConsumer>
            </Provider>
        ));

        const parentStore = parentContainer.get(SampleStore);
        const childStore = childContainer.get(SampleStore);
        expect(childStore === parentStore).toBe(false);
    });

    test('Child should be able to access stores in parent scope', () => {
        let parentContainer!: Container;
        let childContainer!: Container;

        const setParentContainer = (container: Container) => {
            parentContainer = container;
            parentContainer.get(SampleStore).singletonVariable = 4;
        };

        const setChildContainer = (container: Container) => {
            childContainer = container;
        };

        TestRenderer.create((
            <Provider singletons={[SampleStore]}>
                <SampleConsumer setContainer={setParentContainer}>
                    <Provider>
                        <SampleConsumer setContainer={setChildContainer} />
                    </Provider>
                </SampleConsumer>
            </Provider>
        ));

        const childStore = childContainer.get(SampleStore);
        expect(childStore.singletonVariable).toBe(4);        
    });

    test('injected store must be initialized properly', () => {
        @withContainer
        class SampleComponent extends React.Component {
            @injectDependency(SampleStore)
            public sampleStore!: SampleStore;

            componentDidMount() {
                expect(this.sampleStore.singletonVariable).toBe(2);
            }

            render() {
                return <h1>Hakunamatata</h1>;
            }
        }

        TestRenderer.create((
            <Provider singletons={[SampleStore]}>
                <SampleComponent />
            </Provider>
        ));
    });
});
