import * as t from '@babel/types';
import { declare } from '@babel/helper-plugin-utils';

export const defaultChainMethods = [
    'trim',
    'join',
    'filter',
    'reduce',
    'forEach',
    'map',
    'some',
    'every',
    'find',
    'sort',
    'keys',
    'values',
    'entries',
];

interface Options {
    chainMethods: string[];
}

export default declare((api, { chainMethods = defaultChainMethods }: Options) => {
    let currentPath = '';
    const stats = {} as Record<string, number>;

    return {
        name: 'stats-plugin',

        visitor: {
            Program: {
                exit(): void {
                    Object.keys(stats).forEach((key) => {
                        if (key.includes('.')) {
                            const newKey = key.split('.').reverse().join('.');
                            const value = stats[key];

                            delete stats[key];
                            stats[newKey] = value;
                        }
                    });

                    console.log(stats);
                },
            },

            CallExpression: {
                enter(path): void {
                    if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.property)) {
                        const methodName = path.node.callee.property.name;

                        if (chainMethods.includes(methodName)) {
                            if (methodName === 'join' && path.node.arguments.length > 1) {
                                return;
                            }

                            if (currentPath === '') {
                                currentPath = methodName;
                            } else {
                                currentPath = currentPath + '.' + methodName;
                            }

                            if (!stats[currentPath]) {
                                stats[currentPath] = 1;
                            } else {
                                stats[currentPath]++;
                            }

                            let next = path.node.callee.object;

                            while (
                                t.isCallExpression(next) &&
                                t.isMemberExpression(next.callee) &&
                                t.isIdentifier(next.callee.property) &&
                                chainMethods.includes(next.callee.property.name)
                            ) {
                                currentPath = currentPath + '.' + next.callee.property.name;

                                if (!stats[currentPath]) {
                                    stats[currentPath] = 1;
                                } else {
                                    stats[currentPath]++;
                                }

                                next = next.callee.object;
                            }

                            currentPath = '';
                        }
                    } else {
                        currentPath = '';
                    }
                },
            },
        },
    };
});
