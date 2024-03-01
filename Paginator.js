/**
 * Переключатель страниц.
 * @author Alexey B.
 * @version 2024-03-01
 */
class Paginator {
    static classNames = {
        main: "pageSelector",
        pageNumberField: "pageNumberField",
        pageButtonsArea: "pageButtons",
        pageNumbersArea: "pageNumbers",
        prevPageButton: "prevPage",
        nextPageButton: "nextPage",
        pageButton: "page",
        currentPage: "current",
    };

    #selector = "";
    #pagesCount = 1;
    #currentPage = 1;
    #inputField = true;
    #callback = null;
    #rendered = false;

    /**
     * @param {string} selector CSS-селектор используемых контейнеров (куда будет помещаться код переключателей).
     * @param {object} options Дополнительные параметры:
     * * number `pagesCount` — Количество страниц.
     * * number `currentPage` — Текущая страница.
     * * boolean `inputField` — Поле ввода номера страницы.
     * * Function `callback` — Функция, вызываемая при смене страницы.
     */
    constructor(selector, { pagesCount = 1, currentPage = 1, inputField = true, callback = null } = {}) {
        this.#selector = selector;
        this.pagesCount = pagesCount;
        this.currentPage = currentPage;
        this.#callback = callback;
        this.#inputField = Boolean(inputField);
        this.render();
    }

    /** Количество страниц. */
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
        if (this.#rendered)
            this.#updatePageButtons();
    }

    /** Текущая страница. */
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
        if (this.#rendered) {
            this.#updatePageButtons();
            if (this.#inputField)
                document.querySelectorAll(this.#selector + ' > .' + Paginator.classNames.pageNumberField).forEach(element => element.value = value);
            if (this.#callback)
                this.#callback(this.#currentPage);
        }
    }

    get onchange() {
        return this.#callback;
    }
    
    /**
     * Обработчик изменения номера страницы.
     * @param {Function} value
     * */
    set onchange(value) {
        if (value != null && typeof(value) != "function")
            throw new TypeError("Обработчиком изменения страницы может быть только функция.");
        this.#callback = value;
    }


    /** Генерирует HTML-код переключателя страниц и вставляет в контейнеры. */
    render() {
        let html = "";
        const cn = Paginator.classNames;
        if (this.#inputField)
            html += `<input class="${cn.pageNumberField}" type="number"
                      min="1" max="${this.#pagesCount}" value="${this.#currentPage}" title="Страница">`;
        html += `<span class="${cn.pageButtonsArea}">
                    <button class="${cn.pageButton} ${cn.prevPageButton}" title="Предыдущая страница">&lt;</button>
                        <span class="${cn.pageNumbersArea}"> ${this.#generatePageButtons()}</span>
                    <button class="${cn.pageButton} ${cn.nextPageButton}" title="Следующая страница">&gt;</button>
                </span>`;
        document.querySelectorAll(this.#selector).forEach(element => element.innerHTML = html);

        // Обработчики событий
        
        document.querySelectorAll(this.#selector + ' > .' + cn.pageButtonsArea).forEach(element => element.addEventListener("click", event => {
            if (!event.target.classList.contains(cn.pageButton)) return;
            switch (event.target.className) {
                case cn.pageButton + " " + cn.currentPage:
                    return;
                case cn.pageButton + " " + cn.prevPageButton:
                    if (this.currentPage > 1)
                        this.currentPage--;
                    return;
                case cn.pageButton + " " + cn.nextPageButton:
                    if (this.currentPage < this.pagesCount)
                        this.currentPage++;
                    return;
                default:
                    this.currentPage = parseInt(event.target.textContent);
                    return;
            }
        }));

        if (this.#inputField)
            document.querySelectorAll(this.#selector + ' > .' + cn.pageNumberField)
                    .forEach(element => element.addEventListener("change", event => this.currentPage = parseInt(element.value)));

        this.#rendered = true;
    }

    /**
     * Создает и активирует новый объект Paginator.
     * @param {string} selector CSS-селектор используемых контейнеров (куда будет помещаться код переключателей).
     * @param {object} options Дополнительные параметры:
     * * number `pagesCount` — Количество страниц.
     * * number `currentPage` — Текущая страница.
     * * Function `callback` — Функция, вызываемая при смене страницы.
     * * boolean `inputField` — Поле ввода номера страницы.
     */
    static renderNew(selector, options) {
        const paginator = new Paginator(selector, options);
        paginator.render();
        return paginator;
    }


    /** Обновляет код кнопок с номерами страниц. */
    #updatePageButtons() {
        const html = this.#generatePageButtons();
        document.querySelectorAll(this.#selector + ' .' + Paginator.classNames.pageNumbersArea).forEach(element => element.innerHTML = html);
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
    	let className = Paginator.classNames.pageButton;
    	if (pageNumber == this.#currentPage)
	    	className += " " + Paginator.classNames.currentPage;
        return `<button class="${className}">${pageNumber}</button> `;
    }
}