$(document).ready(function () {
  $(document).off("click", ".option").on("click", ".option", function () {
    const $checkbox = $(this).find(".checkbox");
    $checkbox.toggleClass("checked");

    const selected = $(".checkbox.checked")
      .map(function () {
        return parseInt($(this).siblings(".ndl-visual-text").attr("data-testid"), 10);
      })
      .get();

    $(".selected-items").text(
      selected.length > 0
        ? "Selected: " + selected.join(", ")
        : "Selected: None"
    );


    $("[data-testid='featureList']").val(JSON.stringify(selected));
  });
});



