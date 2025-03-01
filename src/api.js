
async function searchGoogle() {
    let query = new URLSearchParams(window.location.search).get('q');
    document.getElementById("query").innerText = query;

    if (!query) return;

    fetchDefinition(query);
    fetchImage(query);
    fetchSearchResults(query);
}

// 1️⃣ Fetching Definition from Wikipedia
async function fetchDefinition(query) {
    let wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    let response = await fetch(wikiUrl);
    let data = await response.json();

    if (data.extract) {
        document.getElementById("definition").innerHTML = `
            <h2 class="text-lg font-bold">Definition:</h2>
            <p>${data.extract}</p>
            <a href="https://en.wikipedia.org/wiki/${query}" target="_blank" class="text-blue-500 underline">Read more</a>
        `;
    } else {
        document.getElementById("definition").innerHTML = "<p>No definition found.</p>";
    }
}

// 2️⃣ Fetching Image from Google Image Search
async function fetchImage(query) {
    let imageUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=${API_KEY}&cx=${CX}&num=1`;
    let response = await fetch(imageUrl);
    let data = await response.json();

    if (data.items && data.items.length > 0) {
        document.getElementById("imageResult").innerHTML = `
            <img src="${data.items[0].link}" class="max-w-xs mx-auto rounded shadow">
        `;
    } else {
        document.getElementById("imageResult").innerHTML = "<p>No image found.</p>";
    }
}

// 3️⃣ Fetching Search Results (Fixing the issue)
async function fetchSearchResults(query) {
    let url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${API_KEY}&cx=${CX}`;
    let response = await fetch(url);
    let data = await response.json();

    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (data.items) {
        data.items.forEach(item => {
            resultsDiv.innerHTML += `
                <div class="p-4 bg-white dark:bg-gray-800 rounded shadow-lg">
                    <h3 class="text-lg font-bold"><a href="${item.link}" class="text-blue-500 hover:text-blue-600" target="_blank">${item.title}</a></h3>
                    <p class="text-sm">${item.snippet}</p>
                    <a href="${item.link}" class="text-gray-500 text-sm">${item.displayLink}</a>
                </div>
            `;
        });
    } else {
        resultsDiv.innerHTML = "<p>No results found.</p>";
    }
}

// 4️⃣ Search by Image (Google Vision API + Custom Search)
async function searchByImage() {
    let input = document.getElementById("imageUpload").files[0];
    if (!input) {
        alert("Please upload an image.");
        return;
    }

    let reader = new FileReader();
    reader.onload = async function () {
        let base64Image = reader.result.split(",")[1];

        // Send Image to Google Vision API
        let visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;
        let body = {
            requests: [
                {
                    image: { content: base64Image },
                    features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
                },
            ],
        };

        let visionResponse = await fetch(visionUrl, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        });

        let visionData = await visionResponse.json();
        if (visionData.responses && visionData.responses[0].labelAnnotations) {
            let bestLabel = visionData.responses[0].labelAnnotations[0].description;
            alert(`Best match: ${bestLabel}`);

            // Perform a Google Search for the detected object
            window.location.href = `search.html?q=${encodeURIComponent(bestLabel)}`;
        } else {
            alert("Couldn't identify the image.");
        }
    };
    reader.readAsDataURL(input);
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

window.onload = searchGoogle;
