import { escapeHtml } from './replaceCode.js'

// Цитирование комментария
export function quoteComment(userName, commentText) {
    const commentInput = document.getElementById('comment')

    if (!commentInput) {
        return
    }

    const safeUserName = escapeHtml(userName)
    const safeCommentText = escapeHtml(commentText)

    const lines = safeCommentText.split('\n')
    const quotedText = lines
        .map((line) => `>${safeUserName}, ${line}`)
        .join('\n')

    commentInput.value = `${quotedText}\n\n`
    commentInput.focus()
    commentInput.selectionStart = commentInput.value.length
    commentInput.selectionEnd = commentInput.value.length
}
