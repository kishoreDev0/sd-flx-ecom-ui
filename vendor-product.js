let variants = [];
let editVariantIndex = null;

function updateVariantHiddenInput() {
  $("[data-testid='variantHiddenInput']").val(JSON.stringify(variants));
}

function renderVariantCards() {
  $(".variant-cards").empty();

  variants.forEach((variant, index) => {
    const card = $(`
      <div class="card" data-index="${index}">
        <button class="remove-btn">&times;</button>
        <div><strong>SKU:</strong> ${variant.sku}</div>
        <div><strong>Price:</strong> ${variant.price}</div>
        <div><strong>Stock:</strong> ${variant.stock}</div>
        <div><strong>Attributes:</strong> ${JSON.stringify(variant.attributes)}</div>
      </div>
    `);

    // Remove
    card.find(".remove-btn").on("click", function (e) {
      e.stopPropagation();
      variants.splice(index, 1);
      renderVariantCards();
    });

    // Edit
    card.on("click", function () {
      editVariantIndex = index;
      $("[data-testid='skuInput']").val(variant.sku);
      $("[data-testid='priceInput']").val(variant.price);
      $("[data-testid='stockInput']").val(variant.stock);
      $("[data-testid='attrInput']").val(JSON.stringify(variant.attributes));
      $(".addVariantBtn").text("Update Variant");
    });

    $(".variant-cards").append(card);
  });

  updateVariantHiddenInput();
}

// Add / Update Variant
$(".addVariantBtn").on("click", function () {
  const sku = $("[data-testid='skuInput']").val().trim();
  const price = parseFloat($("[data-testid='priceInput']").val().trim());
  const stock = parseInt($("[data-testid='stockInput']").val().trim());
  let attributes = [];

  try {
    attributes = JSON.parse($("[data-testid='attrInput']").val().trim() || "[]");
  } catch (e) {
    alert("Invalid attributes JSON");
    return;
  }

  const variantObj = { sku, price, stock, attributes };

  if (editVariantIndex !== null) {
    variants[editVariantIndex] = variantObj;
    editVariantIndex = null;
    $(".addVariantBtn").text("Add Variant");
  } else {
    variants.push(variantObj);
  }

  // Clear inputs
  $("[data-testid='skuInput']").val("");
  $("[data-testid='priceInput']").val("");
  $("[data-testid='stockInput']").val("");
  $("[data-testid='attrInput']").val("");

  renderVariantCards();
});
