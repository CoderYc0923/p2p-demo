import { resolve } from 'path'

export const alias = [
    {
        find: '@',
        replacement: resolve(__dirname, "src")
    },
    {
        find: 'views',
        replacement: resolve(__dirname, "src/views")
    },
    {
        find: 'router',
        replacement: resolve(__dirname, "src/router")
    },
    {
        find: 'assets',
        replacement: resolve(__dirname, "src/assets")
    },
    {
        find: 'components',
        replacement: resolve(__dirname, "src/components")
    }
]