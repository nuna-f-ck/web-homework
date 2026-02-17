import { escapeHtml } from './replaceCode.js'

export function renderComments(list) {
    const container = document.getElementById('comments')
    container.innerHTML = list
        .map(
            (item, index) =>
                `<li class="comment" data-index="${index}">
                <div class="comment-header">
                    <div>${escapeHtml(item.userName)}</div>
                    <div>${item.time}</div>
                </div>
                <div class="comment-body">
                    <div class="comment-text">${escapeHtml(item.commentText)}</div>
                </div>
                <div class="comment-footer">
                    <div class="likes">
                        <span class="likes-counter">${item.likes}</span>
                        <button data-index="${index}" class="like-button ${item.isLiked ? '-active-like' : ''}"></button>
                    </div>
                </div>
            </li>`,
        )
        .join('')
}
