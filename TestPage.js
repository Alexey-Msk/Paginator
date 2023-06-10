document.addEventListener("DOMContentLoaded", function() {
    console.log("Запуск.");
    // debugger;
    Paginator.renderNew("#area1 .pageSelector", { pagesCount: 20, currentPage: 1 });
    Paginator.renderNew("#area2 .pageSelector", { pagesCount: 50, currentPage: 1 });
    Paginator.renderNew("#area3 .pageSelector", { pagesCount: 32, currentPage: 1 });
    const paginator = new Paginator("#area4 .pageSelector", { pagesCount: 48, currentPage: 1 });
    paginator.onchange = page => alert(page);
    paginator.render();
    console.log("Готово.");
});
