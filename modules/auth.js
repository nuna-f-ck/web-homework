let token = localStorage.getItem('token') || ''
let user = JSON.parse(localStorage.getItem('user') || 'null')

export function getToken() {
    return token
}

export function getUserData() {
    return user
}

export function setTokenAndUserData(userData, userToken) {
    token = userToken || ''

    user = {
        name: userData?.name || userData?.login || 'Пользователь',
        login: userData?.login || '',
        id: userData?.id || '',
    }

    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
}

export function logout() {
    token = ''
    user = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
}
