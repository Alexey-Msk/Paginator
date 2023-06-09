/**
 * Переключатель страниц.
 */
class Paginator {
    #pagesCount = 1;
    #currentPage = 1;
    #selector = "";
    #callback = null;
    #inputField = true;

    /**
     * @param {string} selector CSS-селектор используемых контейнеров (куда будет помещаться код переключателей).
     * @param {number} pagesCount Количество страниц.
     * @param {number} currentPage Текущая страница.
     * @param {Function} callback Функция, вызываемая при смене страницы.
     * @param {object} options Дополнительные параметры:
     * * boolean `inputField` — Поле ввода номера страницы.
     */
    constructor(selector, pagesCount, currentPage, callback = null, { inputField = true } = {}) {
        this.#pagesCount = pagesCount;
        this.#currentPage = currentPage;
        this.#selector = selector;
        this.#callback = callback;
        this.#inputField = Boolean(inputField);
        this.#render();

        document.querySelectorAll(selector + ' > .pageButtons').forEach(element => element.addEventListener("click", event => {
            if (!event.target.classList.contains("page")) return;
            switch (event.target.className) {
                case "page current":
                    return;
                case "page prevPage":
                    if (this.currentPage > 1)
                        this.currentPage--;
                    return;
                case "page nextPage":
                    if (this.currentPage < this.pagesCount)
                        this.currentPage++;
                    return;
                default:
                    this.currentPage = parseInt(event.target.textContent);
                    return;
            }
        }));

        if (this.#inputField)
            document.querySelectorAll(selector + ' > .pageNumberField')
                    .forEach(element => element.addEventListener("change", event => this.currentPage = parseInt(element.value)));
    }

    get pagesCount() {
        return this.#pagesCount;
    }

    set pagesCount(value) {
        if (isNaN(value))
            throw new TypeError("Значение pagesCount должно быть числом.");
        if (value < 1)
            throw new RangeError("Значение pagesCount должно быть положительным.");
        if (this.#pagesCount == value) return;
        this.#pagesCount = value;
        this.#updatePageButtons();
    }

    get currentPage() {
        return this.#currentPage;
    }

    set currentPage(value) {
        if (isNaN(value))
            throw new TypeError("Значение currentPage должно быть числом.");
        if (value < 1 || value > this.#pagesCount)
            throw new RangeError("Значение currentPage должно находится в интервале от 1 до pagesCount.");
        if (this.#currentPage == value) return;
        this.#currentPage = value;
        this.#updatePageButtons();
        if (this.#inputField)
            document.querySelectorAll(this.#selector + ' > .pageNumberField').forEach(element => element.value = value);
        if (this.#callback)
            this.#callback(this.#currentPage);
    }

    get onchange() {
        return this.#callback;
    }
    
    set onchange(value) {
        if (value != null && typeof(value) != "function")
            throw new TypeError("Обработчиком изменения страницы может быть только функция.");
        this.#callback = value;
    }

    /** Генерирует HTML-код переключателя страниц и вставляет в контейнеры. */
    #render() {
        let html = "";
        if (this.#inputField)
            html += `<input class="pageNumberField" type="number" min="1" max="${this.#pagesCount}" value="${this.#currentPage}" title="Страница">`;
        html += '<span class="pageButtons">' +
                    '<div class="page prevPage" title="Предыдущая страница">&lt;</div> ' +
                        '<span class="pageNumbers">' + this.#generatePageButtons() + '</span> ' +
                    '<div class="page nextPage" title="Следующая страница">&gt;</div>'+
                '</span>';
        document.querySelectorAll(this.#selector).forEach(element => element.innerHTML = html);
    }

    /** Обновляет код кнопок с номерами страниц. */
    #updatePageButtons() {
        const html = this.#generatePageButtons();
        document.querySelectorAll(this.#selector + ' .pageNumbers').forEach(element => element.innerHTML = html);
    }

    /** Генерирует кнопки с номерами страниц. */
    #generatePageButtons() {
        const pagesCount = this.#pagesCount;
        const currentPage = this.#currentPage;
        const getPageButtons = this.#getPageButtons.bind(this);
        let html = '';
        if (pagesCount <= 10)
            html += getPageButtons(1, pagesCount);
        else {
            if (currentPage <= 5)
                html += getPageButtons(1, Math.min(7, currentPage + 2, pagesCount));
            else {
                html += getPageButtons(1, 2);
                html += " <span>...</span> ";
                html += getPageButtons(Math.max(1, currentPage - 2), Math.min(pagesCount, currentPage + 2));
            }
            if (currentPage < pagesCount - 2) {
                if (currentPage < pagesCount - 4)
                    html += " <span>...</span> ";
                html += getPageButtons(Math.max(pagesCount - 1, currentPage + 3), pagesCount);
            }
        }
        return html;
    }

    #getPageButtons(from, to) {
        let html = "";
        for (let n = from; n <= to; n++)
            html += this.#getPageButton(n);
        return html;
    }

    #getPageButton(pageNumber) {
        return `<div class="page${pageNumber == this.#currentPage ? ' current' : ''}">${pageNumber}</div> `;
    }
}