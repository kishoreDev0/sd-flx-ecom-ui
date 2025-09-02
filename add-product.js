$(document).ready(function () {
  let variants = [];
  let editIndex = -1; // track if editing

  function renderVariantCards() {
    $(".variant-cards").empty();

    variants.forEach((variant, index) => {
      const card = $(`
        <div class="variant-card" style="border:1px solid #ccc; padding:10px; margin:6px 0; border-radius:6px; width:100%;">
          <div><b>Attribute:</b> ${variant.attributes[0].attributeId}</div>
          <div><b>Value:</b> ${variant.attributes[0].attributeValueId}</div>
          <div><b>SKU:</b> ${variant.sku}</div>
          <div><b>Price:</b> ${variant.price}</div>
          <div><b>Stock:</b> ${variant.stock}</div>
          <button class="edit-btn" data-index="${index}" 
            style="margin-top:6px; background:#3498db; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
            Edit
          </button>
          <button class="remove-btn" data-index="${index}" 
            style="margin-top:6px; background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
            Remove
          </button>
        </div>
      `);
      $(".variant-cards").append(card);
    });

    // update hidden input with full array
    $("[data-testid='variantHiddenInput']").val(JSON.stringify(variants));
  }

  // Save (Add / Update) variant
  $("[data-testid='vrntaddbtn']").on("click", function (e) {
    e.preventDefault();

    const attid = $("[data-testid='attid']").val();
    const attvalid = $("[data-testid='attvalid']").val();
    const sku = $("[data-testid='skuInput']").val().trim();
    const price = $("[data-testid='priceInput']").val().trim();
    const stock = $("[data-testid='stockInput']").val().trim();

    if (!attid || !attvalid || !sku || !price || !stock) {
      alert("Please fill all fields before saving");
      return;
    }

    const newVariant = {
      sku: sku,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      attributes: [
        {
          attributeId: parseInt(attid, 10),
          attributeValueId: parseInt(attvalid, 10)
        }
      ]
    };

    if (editIndex === -1) {
      // add new
      variants.push(newVariant);
    } else {
      // update existing
      variants[editIndex] = newVariant;
      editIndex = -1;
      $("[data-testid='vrntaddbtn']").text("Save Variant");
    }

    renderVariantCards();

    // clear fields
    $("[data-testid='attid']").val("");
    $("[data-testid='attvalid']").val("");
    $("[data-testid='skuInput']").val("");
    $("[data-testid='priceInput']").val("");
    $("[data-testid='stockInput']").val("");
  });

  // Edit variant
  $(".variant-cards").on("click", ".edit-btn", function () {
    const index = $(this).data("index");
    const variant = variants[index];

    $("[data-testid='attid']").val(variant.attributes[0].attributeId);
    $("[data-testid='attvalid']").val(variant.attributes[0].attributeValueId);
    $("[data-testid='skuInput']").val(variant.sku);
    $("[data-testid='priceInput']").val(variant.price);
    $("[data-testid='stockInput']").val(variant.stock);

    editIndex = index;
    $("[data-testid='vrntaddbtn']").text("Update Variant");
  });

  // Remove variant
  $(".variant-cards").on("click", ".remove-btn", function () {
    const index = $(this).data("index");
    variants.splice(index, 1);
    renderVariantCards();
  });
});
