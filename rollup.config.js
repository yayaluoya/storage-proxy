import path from 'path';
const pkg = require('./package.json');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
import commonjs from 'rollup-plugin-commonjs';
import ts from 'rollup-plugin-typescript2';

const getPath = _path => path.resolve(__dirname, _path)
const input = 'src/Main.ts';
const extensions = [
    '.js',
    '.ts',
    '.tsx'
]
// ts
const tsPlugin = ts({
    tsconfig: getPath('./tsconfig.json'), // 导入本地ts配置
    extensions
})

// rollup.config.js
export default [
    {
        input: input,
        output: {
            file: pkg.main,
            format: 'umd',
            name: pkg.name,
        },
        plugins: [ // 打包插件
            nodeResolve(extensions),
            commonjs(),
            tsPlugin,
        ]
    },
];