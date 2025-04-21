const fs = require('fs');
const path = require('path');

// Load translations
const loadTranslations = () => {
    const enPath = path.resolve(__dirname, '../locales/en.json');
    const nlPath = path.resolve(__dirname, '../locales/nl.json');

    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const nl = JSON.parse(fs.readFileSync(nlPath, 'utf8'));

    return { en, nl };
};

// Get translation value from nested path
const getTranslationFromPath = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

module.exports = {
    rules: {
        'require-translation-key': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Ensure text content uses translation keys',
                    category: 'Possible Errors',
                    recommended: true,
                },
                schema: [],
            },
            create(context) {
                const translations = loadTranslations();

                return {
                    // Check JSX text content
                    JSXText(node) {
                        const text = node.value.trim();
                        // Ignore empty text, whitespace, and single characters (like dots or spaces)
                        if (text.length > 1 && !/^[\s\r\n]*$/.test(text)) {
                            context.report({
                                node,
                                message: 'Text content should use translation keys instead of hardcoded strings',
                            });
                        }
                    }
                };
            },
        },
        'valid-translation-key': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Ensure translation keys exist in all language files',
                    category: 'Possible Errors',
                    recommended: true,
                },
                schema: [],
            },
            create(context) {
                const translations = loadTranslations();

                return {
                    // Check getTranslation calls
                    CallExpression(node) {
                        if (
                            node.callee.type === 'Identifier' &&
                            node.callee.name === 'getTranslation' &&
                            node.arguments.length > 0 &&
                            node.arguments[0].type === 'Literal'
                        ) {
                            const key = node.arguments[0].value;
                            const enValue = getTranslationFromPath(translations.en, key);
                            const nlValue = getTranslationFromPath(translations.nl, key);

                            if (!enValue || !nlValue) {
                                context.report({
                                    node,
                                    message: `Translation key '${key}' is missing in ${!enValue ? 'English' : 'Dutch'} translations`,
                                });
                            }
                        }
                    },
                    // Check getString calls
                    CallExpression(node) {
                        if (
                            node.callee.type === 'Identifier' &&
                            node.callee.name === 'getString' &&
                            node.arguments.length > 0
                        ) {
                            // Check if the argument is a getTranslation call
                            const arg = node.arguments[0];
                            if (
                                arg.type === 'CallExpression' &&
                                arg.callee.type === 'Identifier' &&
                                arg.callee.name === 'getTranslation' &&
                                arg.arguments.length > 0 &&
                                arg.arguments[0].type === 'Literal'
                            ) {
                                const key = arg.arguments[0].value;
                                const enValue = getTranslationFromPath(translations.en, key);
                                const nlValue = getTranslationFromPath(translations.nl, key);

                                if (!enValue || !nlValue) {
                                    context.report({
                                        node,
                                        message: `Translation key '${key}' is missing in ${!enValue ? 'English' : 'Dutch'} translations`,
                                    });
                                }
                            }
                        }
                    }
                };
            },
        },
    },
}; 