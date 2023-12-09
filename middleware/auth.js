export default defineNuxtRouteMiddleware((to, from) => {
    let token = useCookie('userID');

    if (!token.value) {
        // In a real app you would probably not redirect every route to `/`
        // however it is important to check `to.path` before redirecting or you
        // might get an infinite redirect loop
        if (to.path !== '/login') {
            return navigateTo('/login')
        }
    }
})
