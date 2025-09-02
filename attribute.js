// $(document).ready(function () {
//     const values = [];

//     function updateHiddenInput() {
//         // Convert array to JSON string and set it as the hidden input value
//         $("[data-testid='hiddenInput']").val(JSON.stringify(values));
//     }

//     $(".addBtns").on("click", function () {
//         const value = $("[data-testid='valueInput']").val().trim();
//         const displayName = $("[data-testid='displayInput']").val().trim();

//         if (value && displayName) {
//             const obj = { value, displayName };
//             values.push(obj);

//             // Create card HTML
//             const card = $(`
//                 <div class="card">
//                     <button class="remove-btn">&times;</button>
//                     <div><strong>Value:</strong> ${obj.value}</div>
//                     <div><strong>Display Name:</strong> ${obj.displayName}</div>
//                 </div>
//             `);

//             // Add remove functionality
//             card.find(".remove-btn").on("click", function () {
//                 const index = $(".output-cards .card").index(card);
//                 values.splice(index, 1);
//                 card.remove();
//                 updateHiddenInput();
//             });

//             $(".output-cards").append(card);

//             // Clear inputs
//             $("[data-testid='valueInput']").val("");
//             $("[data-testid='displayInput']").val("");

//             // Update hidden input
//             updateHiddenInput();
//         } else {
//             alert("Please fill in both fields");
//         }
//     });
    
// });


$(document).ready(function () {
    const values = [];
    let editIndex = null; // track which card is being edited

    function updateHiddenInput() {
        // Convert array to JSON string and set it as the hidden input value
        $("[data-testid='hiddenInput']").val(JSON.stringify(values));
    }

    $(".addBtns").on("click", function () {
        const value = $("[data-testid='valueInput']").val().trim();
        const displayName = $("[data-testid='displayInput']").val().trim();

        if (value && displayName) {
            if (editIndex !== null) {
                // update existing card
                values[editIndex] = { value, displayName };

                const card = $(".output-cards .card").eq(editIndex);
                card.find("div").eq(0).html(`<strong>Value:</strong> ${value}`);
                card.find("div").eq(1).html(`<strong>Display Name:</strong> ${displayName}`);

                editIndex = null;
                $(".addBtns").text("Add"); // reset button text
            } else {
                // add new card
                const obj = { value, displayName };
                values.push(obj);

                const card = $(`
                    <div class="card">
                        <button class="remove-btn">&times;</button>
                        <div><strong>Value:</strong> ${obj.value}</div>
                        <div><strong>Display Name:</strong> ${obj.displayName}</div>
                    </div>
                `);

                // remove functionality
                card.find(".remove-btn").on("click", function () {
                    const index = $(".output-cards .card").index(card);
                    values.splice(index, 1);
                    card.remove();
                    updateHiddenInput();
                });

                // edit functionality
                card.on("click", function (e) {
                    if ($(e.target).hasClass("remove-btn")) return; // skip if remove clicked
                    editIndex = $(".output-cards .card").index(card);
                    $("[data-testid='valueInput']").val(values[editIndex].value);
                    $("[data-testid='displayInput']").val(values[editIndex].displayName);
                    $(".addBtns").text("Save");
                });

                $(".output-cards").append(card);
            }

            // clear inputs
            $("[data-testid='valueInput']").val("");
            $("[data-testid='displayInput']").val("");

            updateHiddenInput();
        } else {
            alert("Please fill in both fields");
        }
    });

    
});





