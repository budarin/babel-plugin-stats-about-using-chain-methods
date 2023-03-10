# babel-plugin-stats-about-using-chain-methods

The plugin collects stats info about using chains of methods calls in the code

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-stats-about-using-chain-methods
```

or using yarn:

```sh
yarn add -D babel-plugin-stats-about-using-chain-methods
```

## Options

### chainMethods

Array of method names to collect usage statistics about.

By default it is equal to:

```
[
    'entries', 'every', 'filter', 'find', 'flat', 'flatMap', 'forEach',
    'includes', 'indexOf', 'join', 'keys', 'map', 'reduce', 'reverse',
    'slice', 'some', 'sort', 'splice', 'trim', 'values'
]
```

## Configure

#### Attention!

To collect statistics correctly, the plugin must be the last in the list of registered plugins in babel config.

#### Simple configuration

babel.config.js

```js
module.exports = {
    plugins: ['babel-plugin-stats-about-using-chain-methods'],
};
```

#### Configuration with extending default methods list

```js
const { default: plugin, defaultChainMethods } = require('babel-plugin-stats-about-using-chain-methods');

module.exports = {
    plugins: [
        [
            plugin,
            {
                chainMethods: [
                    'sort',
                    'pop',
                    'unshift',
                    // list of default methods
                    ...defaultChainMethods,
                ],
            },
        ],
    ],
};
```

#### Configuration with custom methods list

```js
module.exports = {
    plugins: [
        [
            'babel-plugin-stats-about-using-chain-method',
            {
                chainMethods: ['enties', 'values', 'keys'],
            },
        ],
    ],
};
```

#### Output processed file name

```js
module.exports = {
    plugins: [
        [
            'babel-plugin-stats-about-using-chain-methods',
            {
                printFileName: true,
            },
        ],
    ],
};
```

## Analyze code

Run the command

```sh
babel <path to the module>
```

The output will contain an object with statistics on the use of call chains from the specified methods in the form of an object

Example output

```sh
{
    forEach: 139,
    join: 122,
    map: 121,
    reduce: 44,
    filter: 43,
    'filter.map': 7,
    'filter.join': 4,
    'filter.reduce': 4,
    'filter.forEach': 1,
    'filter.map.join': 1
    'map.join': 26,
    'map.filter.join': 2,
    'map.join.trim': 2,
    'map.forEach': 1,
    'map.reduce': 1,
    'map.map': 1,
    'join.trim': 3,
    'binary expression with literals': 20
}

```

## Wishes

Feel free to write your suggestions on other types of statistics: what kind of information about the code would be interesting to you.
