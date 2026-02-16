document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("select[data-pagination-select]").forEach((select) => {
        select.addEventListener("change", (e) => {
            const page = e.target.value;

            const url = new URL(window.location.href);
            url.searchParams.set("page", page);

            window.location.href = url.toString();
        });
    });
});
