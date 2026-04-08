import { escapeHtml } from './replaceCode.js'
import { updateComments, commentsList } from './arrayComments.js'
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

// // Обработчик клика на кнопку отправки комментария
// export function createComment() {
//     buttonForm.addEventListener('click', () => {
//         if (nameInput.value === '' || commentInput.value === '') {
//             alert('Заполни все поля')
//             return
//         }

//         const now = new Date()
//         const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear().toString().slice(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

//         // Экранируем данные перед сохранением
//         const safeUserName = escapeHtml(nameInput.value)
//         const safeCommentText = commentInput.value

//         const newComment = {
//             userName: safeUserName,
//             time: dateStr,
//             commentText: safeCommentText,
//             likes: 0,
//             isLiked: false,
//         }

//         fetch('https://wedev-api.sky.pro/api/v1/gleb-fokin/comments', {
//             method: 'POST',
//             body: JSON.stringify(newComment)
//         }).then((resopnse) => {
//             return resopnse.json()
//         }).then((formattedComments) => {
//             updateComments(formattedComments);
//             renderComments(commentsList);
//         })


//         nameInput.value = ''
//         commentInput.value = ''
//         console.log('комментарий отправили')
//     })
// }

export function createComment() {
    buttonForm.addEventListener('click', () => {
        if (nameInput.value === '' || commentInput.value === '') {
            alert('Заполни все поля');
            return;
        }

        const newCommentForServer = {
            name: nameInput.value,
            text: commentInput.value
        };

        fetch('https://wedev-api.sky.pro/api/v1/gleb-fokin/comments', {
            method: 'POST',
            body: JSON.stringify(newCommentForServer)
        })
        .then(response => {
            if (response.status === 201) {
                return fetch('https://wedev-api.sky.pro/api/v1/gleb-fokin/comments');
            } else {
                throw new Error('Ошибка отправки');
            }
        })
        .then(response => response.json())
        .then(data => {
            // Преобразуем ответ в нужный для отображения формат
            const formattedComments = data.comments.map(comment => {
                const date = new Date(comment.date);
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                return {
                    userName: comment.author.name,
                    time: formattedDate,
                    commentText: comment.text,
                    likes: comment.likes || 0,
                    isLiked: comment.isLiked || false,
                };
            });

            updateComments(formattedComments);
            renderComments(commentsList);
        })
        .catch(error => {
            console.error(error);
            alert('Не удалось отправить комментарий');
        });


        nameInput.value = '';
        commentInput.value = '';
    });
}