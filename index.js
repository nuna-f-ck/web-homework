import {
    getToken,
    getUserData,
    logout,
    setTokenAndUserData,
} from './modules/auth.js'
import {
    getComments,
    postComment,
    formatCommentDate,
    handleApiError,
} from './modules/api.js'
import { renderComments } from './modules/render.js'
import { quoteComment } from './modules/createComment.js'

let commentsList = []

function mapComments(comments) {
    return comments.map((comment) => {
        return {
            id: comment.id,
            userName: comment.author.name,
            login: comment.author.login,
            time: formatCommentDate(comment.date),
            commentText: comment.text,
            likes: comment.likes ?? 0,
            isLiked: false,
        }
    })
}

function renderApp() {
    const app = document.getElementById('app')
    const user = getUserData()

    app.innerHTML = `
        <div class="container">
            <ul class="comments" id="comments"></ul>
            <div id="auth-block"></div>
        </div>
    `

    renderAuthBlock(user)
    fetchAndRenderComments()
}

function renderAuthBlock(user) {
    const authBlock = document.getElementById('auth-block')

    if (!user || !getToken()) {
        authBlock.innerHTML = `
            <div class="auth-prompt">
                <a href="#" id="go-to-login-link">Чтобы добавить комментарий, авторизуйтесь</a>
            </div>
        `

        const goToLoginLink = document.getElementById('go-to-login-link')
        goToLoginLink.addEventListener('click', (event) => {
            event.preventDefault()
            renderLoginPage()
        })

        return
    }

    authBlock.innerHTML = `
        <div class="add-form" id="add-form">
            <input
                type="text"
                class="add-form-name"
                id="name"
                value="${escapeAttribute(user.name)}"
                readonly
            />

            <textarea
                class="add-form-text"
                placeholder="Введите ваш комментарий"
                rows="4"
                id="comment"
            ></textarea>

            <div class="add-form-row">
                <button class="add-form-button" id="button">Написать</button>
                <button class="add-form-button" id="logout-button">Выйти</button>
            </div>
        </div>
    `

    initCreateComment()
    initLogoutButton()
}

function renderLoginPage() {
    const app = document.getElementById('app')

    app.innerHTML = `
        <div class="container">
            <div class="login-page">
                <h2>Авторизация</h2>

                <div class="add-form" id="login-form-container">
                    <input
                        type="text"
                        class="add-form-name"
                        placeholder="Введите логин"
                        id="login"
                    />

                    <input
                        type="password"
                        class="add-form-name"
                        placeholder="Введите пароль"
                        id="password"
                    />

                    <div class="add-form-row">
                        <button class="add-form-button" id="login-button">Войти</button>
                        <button class="add-form-button" id="back-button">Назад</button>
                    </div>
                </div>
            </div>
        </div>
    `

    const loginButton = document.getElementById('login-button')
    const backButton = document.getElementById('back-button')
    const passwordInput = document.getElementById('password')
    const loginInput = document.getElementById('login')

    loginButton.addEventListener('click', () => {
        loginUser()
    })

    backButton.addEventListener('click', () => {
        renderApp()
    })

    passwordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            loginUser()
        }
    })

    loginInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            loginUser()
        }
    })
}

function loginUser() {
    const loginInput = document.getElementById('login')
    const passwordInput = document.getElementById('password')
    const loginFormContainer = document.getElementById('login-form-container')

    const login = loginInput.value.trim()
    const password = passwordInput.value.trim()

    if (!login || !password) {
        alert('Введите логин и пароль')
        return
    }

    const loadingElement = document.createElement('div')
    loadingElement.classList.add('loading')
    loadingElement.textContent = 'Выполняется вход...'

    loginFormContainer.style.display = 'none'
    loginFormContainer.after(loadingElement)

    fetch('https://wedev-api.sky.pro/api/user/login', {
        method: 'POST',
        body: JSON.stringify({
            login,
            password,
        }),
    })
        .then((response) => {
            if (response.status === 400) {
                return response
                    .json()
                    .catch(() => null)
                    .then((data) => {
                        const message =
                            data?.error ||
                            data?.message ||
                            'Неверный логин или пароль'
                        throw new Error(message)
                    })
            }

            if (response.status === 500) {
                throw new Error('Сервер сломался, попробуй позже')
            }

            if (!response.ok) {
                throw new Error('Что-то пошло не так')
            }

            return response.json()
        })
        .then((data) => {
            const authData = extractAuthData(data)

            if (!authData.token || !authData.user) {
                console.error('Неожиданный формат ответа авторизации:', data)
                throw new Error('Сервер вернул некорректные данные авторизации')
            }

            setTokenAndUserData(authData.user, authData.token)
            renderApp()
        })
        .catch((error) => {
            console.error(error)

            if (error.message === 'Failed to fetch') {
                alert('Кажется, у вас сломался интернет, попробуйте позже')
            } else {
                alert(error.message)
            }

            loginFormContainer.style.display = 'flex'
            loadingElement.remove()
        })
}

function extractAuthData(data) {
    const possibleToken =
        data?.user?.token ||
        data?.token ||
        data?.result?.token ||
        data?.userData?.token ||
        ''

    const possibleUser =
        data?.user ||
        data?.result?.user ||
        data?.userData ||
        (data?.name || data?.login
            ? {
                  name: data.name ?? data.login,
                  login: data.login ?? '',
                  id: data.id ?? '',
              }
            : null)

    return {
        token: possibleToken,
        user: possibleUser,
    }
}

function fetchAndRenderComments() {
    const commentsContainer = document.getElementById('comments')

    commentsContainer.innerHTML = `
        <li class="loading">Комментарии загружаются...</li>
    `

    getComments()
        .then((data) => {
            commentsList = mapComments(data.comments)
            renderComments(commentsList)
            initCommentsHandlers()
        })
        .catch((error) => {
            console.error('Ошибка загрузки комментариев', error)
            commentsContainer.innerHTML = `
                <li class="loading">${handleApiError(error)}</li>
            `
        })
}

function initCommentsHandlers() {
    const commentElements = document.querySelectorAll('.comment')
    const likeButtons = document.querySelectorAll('.like-button')

    commentElements.forEach((commentElement) => {
        commentElement.addEventListener('click', (event) => {
            if (event.target.classList.contains('like-button')) {
                return
            }

            const index = Number(commentElement.dataset.index)
            const comment = commentsList[index]

            quoteComment(comment.userName, comment.commentText)
        })
    })

    likeButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation()

            const index = Number(button.dataset.index)
            handleLikeClick(index)
        })
    })
}

function handleLikeClick(index) {
    const comment = commentsList[index]

    commentsList[index] = {
        ...comment,
        isLiked: !comment.isLiked,
        likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
    }

    renderComments(commentsList)
    initCommentsHandlers()
}

function initCreateComment() {
    const buttonForm = document.getElementById('button')
    const nameInput = document.getElementById('name')
    const commentInput = document.getElementById('comment')
    const addForm = document.getElementById('add-form')

    if (!buttonForm || !nameInput || !commentInput || !addForm) {
        return
    }

    buttonForm.addEventListener('click', () => {
        const commentText = commentInput.value.trim()
        const userName = nameInput.value.trim()

        if (!userName || !commentText) {
            alert('Заполни все поля')
            return
        }

        if (userName.length < 3 || commentText.length < 3) {
            alert('Имя и комментарий должны быть не короче 3 символов')
            return
        }

        const loadingElement = document.createElement('div')
        loadingElement.textContent = 'Комментарий добавляется...'
        loadingElement.classList.add('loading')

        addForm.style.display = 'none'
        addForm.after(loadingElement)

        postComment({
            text: commentText,
        })
            .then(() => {
                return getComments()
            })
            .then((data) => {
                commentsList = mapComments(data.comments)
                renderComments(commentsList)
                initCommentsHandlers()

                addForm.style.display = 'flex'
                loadingElement.remove()
                commentInput.value = ''
            })
            .catch((error) => {
                console.error(error)
                alert(handleApiError(error))

                addForm.style.display = 'flex'
                loadingElement.remove()
            })
    })
}

function initLogoutButton() {
    const logoutButton = document.getElementById('logout-button')

    if (!logoutButton) {
        return
    }

    logoutButton.addEventListener('click', () => {
        logout()
        renderApp()
    })
}

function escapeAttribute(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}

renderApp()
