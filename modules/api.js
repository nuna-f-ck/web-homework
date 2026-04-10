import { getToken } from './auth.js'

const host = 'https://wedev-api.sky.pro/api/v2/gleb-fokin/comments'

export function getComments() {
    const token = getToken()

    const options = {
        method: 'GET',
    }

    if (token) {
        options.headers = {
            Authorization: `Bearer ${token}`,
        }
    }

    return fetch(host, options).then((response) => {
        if (response.status === 500) {
            throw new Error('Сервер сломался, попробуй позже')
        }

        if (!response.ok) {
            throw new Error('Ошибка загрузки комментариев')
        }

        return response.json()
    })
}

export function postComment({ text }) {
    return fetch(host, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
            text,
        }),
    }).then((response) => {
        if (response.status === 400) {
            return response
                .json()
                .catch(() => null)
                .then((data) => {
                    const message =
                        data?.error ||
                        'Имя и комментарий должны быть не короче 3 символов'
                    throw new Error(message)
                })
        }

        if (response.status === 401) {
            throw new Error('Необходимо авторизоваться')
        }

        if (response.status === 500) {
            throw new Error('Сервер сломался, попробуй позже')
        }

        if (!response.ok) {
            throw new Error('Ошибка добавления комментария')
        }

        return response.json()
    })
}

export function formatCommentDate(dateString) {
    const date = new Date(dateString)

    return `${date.getDate().toString().padStart(2, '0')}.${(
        date.getMonth() + 1
    )
        .toString()
        .padStart(2, '0')}.${date.getFullYear().toString().slice(-2)} ${date
        .getHours()
        .toString()
        .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function handleApiError(error) {
    if (error.message === 'Failed to fetch') {
        return 'Кажется, у вас сломался интернет, попробуйте позже'
    }

    return error.message
}
