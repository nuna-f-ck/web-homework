import { renderComments } from './render.js'

export function clickOnComment(commentsList, updateComments) {
    document.addEventListener('click', (event) => {
        if (!event.target.classList.contains('like-button')) {
            return
        }

        const index = Number(event.target.dataset.index)
        const comment = commentsList[index]

        commentsList[index] = {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
        }

        updateComments(commentsList)
        renderComments(commentsList)
    })
}
