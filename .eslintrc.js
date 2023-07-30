/* eslint-disable unicorn/prefer-module */
module.exports = {
	root: true,
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2020,
		sourceType: "module"
	},
	env: {
		browser: true,
		commonjs: true,
		es6: true,
		node: true
	},
	rules: {
		semi: ["error", "always"],
		"unicorn/filename-case": ["error", { case: "camelCase" }],
		"no-console": ["error"],
		"unicorn/no-fn-reference-in-iterator": "off",
		"unicorn/no-reduce": "off",
		"unicorn/no-null": "off",
		"unicorn/switch-case-braces": "off",
		"no-restricted-syntax": [
			"error",
			{
				selector: "ExportDefaultDeclaration",
				message: "Prefer named exports"
			}
		],
		"unicorn/no-array-reduce": "off",
		"unicorn/no-array-for-each": "off",
		"unicorn/no-array-callback-reference": "off",
		"unicorn/prefer-node-protocol": "off",
		"unicorn/prefer-object-from-entries": ["off"],
		"unicorn/no-useless-undefined": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"react/jsx-uses-react": "off",
		"react/react-in-jsx-scope": "off",
		"react/prop-types": [2, { ignore: ["children"] }]
	},
	plugins: ["react-hooks", "react", "jsx-a11y", "prettier", "unicorn", "security", "import"],
	extends: [
		"eslint:recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:unicorn/recommended",
		"plugin:jsx-a11y/recommended",
		"plugin:react/recommended",
		"plugin:prettier/recommended",
		"prettier"
	],
	overrides: [
		{
			files: ["**/*.ts?(x)"],
			parser: "@typescript-eslint/parser",
			parserOptions: {
				ecmaVersion: 2018,
				sourceType: "module",
				ecmaFeatures: {
					jsx: true
				},

				// typescript-eslint specific options
				warnOnUnsupportedTypeScriptVersion: true
			},
			plugins: ["@typescript-eslint"],
			extends: ["plugin:import/typescript", "plugin:@typescript-eslint/recommended"],
			rules: {
				"@typescript-eslint/explicit-function-return-type": ["error"]
			}
		},
		{
			files: ["**/*.d.ts"],
			rules: {
				"@typescript-eslint/triple-slash-reference": ["off"],
				"@typescript-eslint/no-namespace": ["off"],
				"unicorn/prevent-abbreviations": ["off"],
				"no-restricted-syntax": ["off"],
				"unicorn/filename-case": ["off"]
			}
		},
		{
			files: [".eslintrc*.js"],
			rules: {
				"unicorn/prefer-module": ["off"],
				"unicorn/filename-case": ["off"]
			},
			env: {
				commonjs: true,
				node: true
			}
		}
	],
	settings: {
		react: {
			version: "detect" // React version. "detect" automatically picks the version you have installed.
			// You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
			// default to latest and warns if missing
			// It will default to "detect" in the future
		},
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"]
		},
		"import/resolver": {
			typescript: {} // this loads <rootdir>/tsconfig.json to eslint
		}
	}
};
