async function query(data) {
    const response = await fetch("https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud", {
        headers: {
            "Accept": "image/png",
            "Authorization": "  ",
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data),
    });

    const result = await response.blob();
    return result;
}

// Map to store the last submitted inputs for each panel
const lastInputs = {};

async function generateComic() {
    const comicContainer = document.getElementById("comic-container");

    console.log("Generating Comic...");

    for (let i = 1; i <= 10; i++) {
        const textarea = document.querySelector(`.panel-input:nth-of-type(${i})`);

        if (!textarea) {
            console.error(`Textarea for Panel ${i} not found.`);
            continue;
        }

        const description = textarea.value;

        // Skip API query if input is empty or unchanged
        if (!description.trim()) {
            console.log(`Panel ${i} - Input is empty or unchanged. Skipping...`);
            continue;
        }

        console.log(`Panel ${i} - Making API request...`);

        // Show loading indicator
        const panel = document.getElementById(`panel${i}`);
        panel.innerHTML = ""; // Clear previous content
        panel.classList.add("loading");

        try {
            // Fetch image with timeout
            const imageData = await Promise.race([query({ "inputs": description }), timeout(600000)]);

            // Remove loading indicator
            panel.classList.remove("loading");

            if (!imageData) {
                throw new Error("API response is empty");
            }

            const imageUrl = URL.createObjectURL(imageData);

            // Update the panel with the new image
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = `Panel ${i}`;
            panel.appendChild(img);

            // Update the last submitted input for this panel
            lastInputs[i] = description.trim();

            // Wait for a short duration before moving to the next panel
            await delay(1000);
        } catch (error) {
            console.error(`Error for Panel ${i}:`, error);
            panel.classList.add("error");
            panel.innerText = `Error: Panel ${i}`;
        }
    }

    console.log("Comic Generation complete!");
}

// Timeout function
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to download the entire comic (as .png file)
function downloadComic() {
    const comicContainer = document.getElementById("comic-container");
    html2canvas(comicContainer).then(canvas => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL();
        link.download = "comic.png";
        link.click();
    });
}

// Additional function to introduce delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
