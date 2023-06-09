document.addEventListener("DOMContentLoaded", function() {
    console.log("Запуск.");
    // debugger;
    new Paginator("#area1 .pageSelector", 20, 1);
    new Paginator("#area2 .pageSelector", 50, 1);
    new Paginator("#area3 .pageSelector", 32, 1);
    const paginator = new Paginator("#area4 .pageSelector", 48, 1);
    paginator.onchange = page => alert(page);
    console.log("Готово.");
});
