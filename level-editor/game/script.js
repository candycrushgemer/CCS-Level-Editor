// Fetch and render ccsplayer/canvas/player.html onto canvas#game

document.addEventListener('DOMContentLoaded', async function renderPlayerHtmlOnCanvas() {
    const canvas = document.getElementById('game');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Set canvas size to match its displayed size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    try {
        // Fetch the HTML file as text
        const response = await fetch('ccsplayer/canvas/player.html');
        if (!response.ok) throw new Error('Failed to load player.html');
        const htmlText = await response.text();

        // Parse the HTML and extract the <body> content
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const bodyContent = doc.body.innerHTML;

        // Create a temporary container to render the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = bodyContent;

        // Create an SVG foreignObject to render HTML as image
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", canvas.width);
        svg.setAttribute("height", canvas.height);

        const foreignObject = document.createElementNS(svgNS, "foreignObject");
        foreignObject.setAttribute("width", "100%");
        foreignObject.setAttribute("height", "100%");
        foreignObject.appendChild(tempDiv);

        svg.appendChild(foreignObject);

        // Serialize SVG and create an image
        const svgString = new XMLSerializer().serializeToString(svg);
        const img = new window.Image();
        img.onload = function() {
            // Clear canvas and draw the image
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

    } catch (err) {
        // Debug message (no personal info, no emoji)
        console.error('Failed to render player.html on canvas:', err);
        
        // Fallback: draw error message on canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Failed to load player.html', canvas.width / 2, canvas.height / 2);
    }
});
