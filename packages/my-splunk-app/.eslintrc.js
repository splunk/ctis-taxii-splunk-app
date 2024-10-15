module.exports = {
    extends: '@splunk/eslint-config/browser-prettier',
    overrides: [
        {
            // feel free to replace with your preferred file pattern - eg. 'src/**/*Slice.ts'
            files: ['src/**/*.slice.js'],
            // avoid state param assignment
            rules: { 'no-param-reassign': ['error', { props: false }] },
        },
    ]
};
