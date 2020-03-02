module.exports = {
    globals: {
        __PATH_PREFIX__: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: [
      "@typescript-eslint",
      "import",
    ],
    parserOptions: {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    rules: {
        "no-shadow": [
            "error",
        ],
        "func-style": [
            "error",
            "declaration",
        ],
        "no-duplicate-imports": [
            "error",
            {
                "includeExports": false,
            },
        ],
        "@typescript-eslint/explicit-function-return-type": [
            "off",
        ],
        "@typescript-eslint/indent": [
            "error",
            4
        ],
        "brace-style": "off",
        "@typescript-eslint/brace-style": [
            "error",
            "allman"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "quotes": [
            "error",
            "double",
            {
              "allowTemplateLiterals": true
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "eol-last": [
            "error",
            "always"
        ],
        "@typescript-eslint/no-empty-interface": [
            "off",
        ],
        "no-throw-literal": [
            "error",
        ],
        // note: I'm not prepared to relax things this much.
        "@typescript-eslint/no-explicit-any": [
            "off",
        ],
        "@typescript-eslint/no-use-before-define": [
            "off",
        ],
        "one-var": [
            "error",
            "never",
        ],
        "no-trailing-spaces": [
            "error",
        ],
        "no-nested-ternary": [
            "error",
        ],
        "newline-before-return": [
            "error",
        ],
        "@typescript-eslint/no-namespace": [
            "error",
        ],
        "no-multi-spaces": [
            "error",
        ],
        "import/first": [
            "error",
        ],
        "import/no-cycle": [
            "error",
        ],
        "import/no-default-export": [
            "error",
        ],
        "import/newline-after-import": [
            "error",
            {
                count: 2,
            },
        ],
        "@typescript-eslint/type-annotation-spacing": [
            "error",
            {
                "after": true,
            },
        ],
        "key-spacing": [
            "error",
            {
                "beforeColon": false,
                "afterColon": true,
            }
        ],
        "no-lonely-if": [
            "error",
        ],
        "object-curly-spacing": [
            "error",
            "always",
        ],
        "array-bracket-spacing": [
            "error",
            "always",
        ],
        "comma-style": [
            "error",
            "last",
        ],
        "space-unary-ops": [
            "error",
            {
                "words": true,
                "nonwords": true,
            }
        ],
        "comma-dangle": [
            "error",
            {
                "arrays": "only-multiline",
                "objects": "only-multiline",
                "imports": "never",
                "exports": "never",
                "functions": "never",
            }
        ],
        "no-multiple-empty-lines": [
            "error",
            {
                max: 2,
            }
        ],
        "space-before-function-paren": [
            2,
            {
                "anonymous": "always",
                "named": "never"
            }
        ]
    }
};
