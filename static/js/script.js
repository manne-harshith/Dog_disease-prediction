document.getElementById("uploadForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let fileInput = document.getElementById("imageInput").files[0];
    if (!fileInput) {
        alert("Please select an image!");
        return;
    }

    let formData = new FormData();
    formData.append("image", fileInput);

    // Show the modal while processing
    const modal = new bootstrap.Modal(document.getElementById('content'));
    modal.show();

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
            modal.hide();
            return;
        }

        let probabilities = Object.values(data.predictions);
        let maxProbability = Math.max(...probabilities);

        if (maxProbability >= 98) {
            // Show image preview
            let previewImage = document.getElementById("previewImage");
            previewImage.src = data.image_path;
            previewImage.style.display = "block";

            // Display predictions
            let resultContainer = document.getElementById("results");
            let predictionList = document.getElementById("predictionList");
            predictionList.innerHTML = ""; // Clear previous results

            for (let [disease, confidence] of Object.entries(data.predictions)) {
                let listItem = document.createElement("li");
                listItem.innerHTML = `<b>${disease.replace("_", " ").toUpperCase()}</b>: ${confidence}%`;
                predictionList.appendChild(listItem);
            }

            resultContainer.style.display = "block";
        } else {
            alert("The uploaded image does not seem to be a valid dog image. Please try again.");
            document.getElementById("previewImage").style.display = "none";
            document.getElementById("results").style.display = "none";
            modal.hide();
        }
    })
    .catch(error => {
        alert("Something went wrong!");
        console.error("Error:", error);
        modal.hide();
    });
});

// Restrict file types to images
document.getElementById("imageInput").addEventListener("change", function () {
    let file = this.files[0];
    if (file) {
        let allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
        
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type! Please upload an image (JPG, PNG, GIF).");
            this.value = "";
        }
    }
});