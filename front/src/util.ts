import * as React from 'react';

export function stateless<T>(name: string, factory: (props: T) => any): React.ClassicComponentClass<T> {
    return React.createClass<T, {}>({
        displayName: name,
        render() {
            return factory(this.props);
        }
    });
}
