import { RouteRecordRaw } from "vue-router"

export const fatherRouters:RouteRecordRaw[] = [
    {
        path: '/father',
        name: 'Father',
        redirect: {name: 'Children1'},
        component: () => import(/* webpackChunkName: "father" */ "views/Father/index.vue"),
        children: [
            {
                path: 'children1',
                name: 'Children1',
                component: () => import(/* webpackChunkName: "father" */ "views/Father/Children1/index.vue"),
            },
            {
                path: 'children2',
                name: 'Children2',
                component: () => import(/* webpackChunkName: "father" */ "views/Father/Children2/index.vue"),
            }
        ]
    }
]