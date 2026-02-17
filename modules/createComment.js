import { escapeHtml } from './replaceCode.js'
import { commentsList } from './arrayComments.js'
import { renderComments } from './render.js'

// Находим элементы из html
const nameInput = document.getElementById('name')
const commentInput = document.getElementById('comment')
const buttonForm = document.getElementById('button')

// Функция для добавления цитирования
export function quoteComment(userName, commentText) {
    const safeUserName = escapeHtml(userName)
    const safeCommentText = escapeHtml(commentText)

    const lines = safeCommentText.split('\n')
    const quotedText = lines
        .map((line) => `> ${safeUserName}, ${line}`)
        .join('\n')

    commentInput.value = `${quotedText}\n\n`

    commentInput.focus()
    commentInput.selectionStart = commentInput.value.length
    commentInput.selectionEnd = commentInput.value.length
}

// Обработчик клика на кнопку отправки комментария
export function createComment() {
    buttonForm.addEventListener('click', () => {
        if (nameInput.value === '' || commentInput.value === '') {
            alert('Заполни все поля')
            return
        }

        const now = new Date()
        const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

        // Экранируем данные перед сохранением
        const safeUserName = escapeHtml(nameInput.value)
        const safeCommentText = commentInput.value

        commentsList.push({
            userName: safeUserName,
            time: dateStr,
            commentText: safeCommentText,
            likes: 0,
            isLiked: false,
        })

        renderComments(commentsList)

        nameInput.value = ''
        commentInput.value = ''
        console.log('комментарий отправили')
    })
}
