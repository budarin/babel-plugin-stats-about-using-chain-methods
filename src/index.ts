import * as t from '@babel/types';
import { declare } from '@babel/helper-plugin-utils';

import type { PluginObj, PluginPass } from '@babel/core';

export const defaultChainMethods = [
    'entries',
    'every',
    'filter',
    'find',
    'flat',
    'flatMap',
    'forEach',
    'includes',
    'indexOf',
    'join',
    'keys',
    'map',
    'reduce',
    'reverse',
    'slice',
    'some',
    'sort',
    'splice',
    'trim',
    'values',
];

interface Options {
    printFileName: boolean;
    chainMethods: string[];
}

type State = {
    currentPath: string;
    stats: Record<string, number>;
};

// @ts-ignore
export default declare<Options, PluginObj<PluginPass & State>>((api, options) => {
    const { chainMethods = defaultChainMethods, printFileName = false } = options;

    return {
        name: 'babel-plugin-stats-about-using-chain-methods',

        visitor: {
            Program: {
                enter(_, state): void {
                    state.currentPath = '';
                    state.stats = {} as Record<string, number>;
                },

                exit(_, state): void {
                    Object.keys(state.stats).forEach((key) => {
                        if (key.includes('.')) {
                            const newKey = key.split('.').reverse().join('.');
                            const value = state.stats[key];

                            delete state.stats[key];
                            state.stats[newKey] = value;
                        }
                    });

                    if (Object.keys(state.stats).length > 0) {
                        if (printFileName) {
                            console.log(state.filename);
                        }
                        console.log(state.stats);
                    }
                },
            },

            CallExpression: {
                enter(path, state): void {
                    if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.property)) {
                        const methodName = path.node.callee.property.name;

                        if (chainMethods.includes(methodName)) {
                            if (methodName === 'join' && path.node.arguments.length > 1) {
                                return;
                            }

                            if (state.currentPath === '') {
                                state.currentPath = methodName;
                            } else {
                                state.currentPath = state.currentPath + '.' + methodName;
                            }

                            let next = path.node.callee.object;

                            while (
                                t.isCallExpression(next) &&
                                t.isMemberExpression(next.callee) &&
                                t.isIdentifier(next.callee.property) &&
                                chainMethods.includes(next.callee.property.name)
                            ) {
                                state.currentPath = state.currentPath + '.' + next.callee.property.name;
                                next = next.callee.object;
                            }

                            if (!state.stats[state.currentPath]) {
                                state.stats[state.currentPath] = 1;
                            } else {
                                state.stats[state.currentPath]++;
                            }

                            state.currentPath = '';

                            path.skip();
                        }
                    }
                },
            },
        },
    };
});
