import { commentsList } from './arrayComments.js'
import { renderComments } from './render.js'
import { quoteComment } from './createComment.js'

// Находим элементы из html
const comments = document.getElementById('comments')

// Обработчик клика на список комментариев
export function clickOnComment() {
    comments.addEventListener('click', (event) => {
        // Если клик на кнопке лайка
        if (event.target.classList.contains('like-button')) {
            event.stopPropagation()
            const index = event.target.dataset.index

            if (commentsList[index].isLiked === false) {
                commentsList[index].isLiked = true
                commentsList[index].likes += 1
            } else {
                commentsList[index].isLiked = false
                commentsList[index].likes -= 1
            }

            console.log('на лайк нажали')
            renderComments(commentsList)
            return
        }

        // Если клик на комментарии (но не на лайке)
        const commentElement = event.target.closest('.comment')
        if (commentElement) {
            const index = commentElement.dataset.index
            const commentData = commentsList[index]

            quoteComment(commentData.userName, commentData.commentText)
            console.log('на комментарий нажали, начато цитирование')
        }
        renderComments(commentsList)
    })
}
