// Функция для экранирования HTML
export function escapeHtml(text) {
    if (text == null) {
        return ''
    }

    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
}
