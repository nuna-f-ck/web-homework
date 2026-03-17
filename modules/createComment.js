import { escapeHtml } from './replaceCode.js';
import { commentsList, updateComments } from './arrayComments.js'; // обязательно импортируем updateComments
import { renderComments } from './render.js';

// Находим элементы из html
const nameInput = document.getElementById('name');
const commentInput = document.getElementById('comment');
const buttonForm = document.getElementById('button');

// Функция для добавления цитирования
export function quoteComment(userName, commentText) {
    const safeUserName = escapeHtml(userName);
    const safeCommentText = escapeHtml(commentText);

    const lines = safeCommentText.split('\n');
    const quotedText = lines
        .map((line) => `> ${safeUserName}, ${line}`)
        .join('\n');

    commentInput.value = `${quotedText}\n\n`;
    commentInput.focus();
    commentInput.selectionStart = commentInput.value.length;
    commentInput.selectionEnd = commentInput.value.length;
}

// Обработчик клика на кнопку отправки комментария
export function createComment() {
    buttonForm.addEventListener('click', () => {
        // Проверка заполнения полей
        if (nameInput.value === '' || commentInput.value === '') {
            alert('Заполни все поля');
            return;
        }

        // Формируем объект комментария в том виде, который ожидает сервер
        const newComment = {
            text: commentInput.value,
            author: {
                name: nameInput.value
            }
            // date не отправляем, сервер сам генерирует дату
        };

        // Отправляем POST-запрос
        fetch('https://wedev-api.sky.pro/api/v1/:gleb-fokin/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // ОБЯЗАТЕЛЬНО!
            },
            body: JSON.stringify(newComment)
        })
        .then((response) => {
            if (!response.ok) {
                // Пытаемся получить текст ошибки от сервера
                return response.json().then((errorData) => {
                    throw new Error(errorData.message || 'Ошибка при отправке');
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log('Ответ сервера после POST:', data); // для отладки

            // После успешной отправки нужно обновить список комментариев
            // Пробуем взять обновлённый список из ответа сервера (если есть поле comments)
            if (data.comments && Array.isArray(data.comments)) {
                const formattedComments = data.comments.map(comment => {
                    // Форматируем дату из ISO в "dd.mm.yy hh:mm"
                    const date = new Date(comment.date);
                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                    return {
                        userName: comment.author.name,
                        time: formattedDate,
                        commentText: comment.text,
                        likes: comment.likes || 0,
                        isLiked: comment.isLiked || false
                    };
                });
                updateComments(formattedComments);
                renderComments(commentsList);
            } else {
                // Если сервер не вернул список, делаем отдельный GET-запрос
                console.warn('Сервер не вернул обновлённый список, запрашиваем сами');
                return fetch('https://wedev-api.sky.pro/api/v1/:gleb-fokin/comments')
                    .then((res) => res.json())
                    .then((getData) => {
                        const formattedComments = getData.comments.map(comment => {
                            const date = new Date(comment.date);
                            const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                            return {
                                userName: comment.author.name,
                                time: formattedDate,
                                commentText: comment.text,
                                likes: comment.likes || 0,
                                isLiked: comment.isLiked || false
                            };
                        });
                        updateComments(formattedComments);
                        renderComments(commentsList);
                    });
            }

            // Очищаем поля ввода
            nameInput.value = '';
            commentInput.value = '';
            console.log('Комментарий успешно отправлен');
        })
        .catch((error) => {
            console.error('Ошибка при отправке комментария:', error);
            alert('Не удалось отправить комментарий. Проверьте консоль.');
        });
    });
}