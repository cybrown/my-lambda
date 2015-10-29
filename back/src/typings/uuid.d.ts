// Type definitions for UUID.js core-1.0
// Project: https://github.com/LiosK/UUID.js
// Definitions by: Jason Jarrett <https://github.com/staxmanade/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module 'uuid' {

    export = uuid;
    var uuid: UUIDStatic;

    interface UUIDStatic {
        (): string;
    }
}
