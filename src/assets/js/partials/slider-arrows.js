// Replace slider arrow icons with new feather icons
document.addEventListener('DOMContentLoaded', function() {
    // New arrow SVGs
    const leftArrowSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon feather feather-chevron-left" aria-hidden="true" focusable="false" role="presentation"><path d="m15 18-6-6 6-6"></path></svg>`;
    
    const rightArrowSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon feather feather-chevron-right" aria-hidden="true" focusable="false" role="presentation"><path d="m9 18 6-6-6-6"></path></svg>`;

    // Function to replace arrows
    function replaceSliderArrows() {
        // Find all slider button icons
        const sliderIcons = document.querySelectorAll('.s-slider-button-icon');
        
        sliderIcons.forEach(icon => {
            const svg = icon.querySelector('svg');
            if (svg) {
                const title = svg.querySelector('title');
                if (title) {
                    const titleText = title.textContent;
                    
                    // Replace based on title content
                    if (titleText === 'keyboard_arrow_left') {
                        icon.innerHTML = leftArrowSVG;
                    } else if (titleText === 'keyboard_arrow_right') {
                        icon.innerHTML = rightArrowSVG;
                    }
                }
            }
        });
    }

    // Run replacement on page load
    replaceSliderArrows();
    console.log('replaceSliderArrows');
    
    // Also run when new content is dynamically loaded (for AJAX content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                // Check if any added nodes contain slider icons
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList && node.classList.contains('s-slider-button-icon')) {
                            replaceSliderArrows();
                        } else if (node.querySelector && node.querySelector('.s-slider-button-icon')) {
                            replaceSliderArrows();
                        }
                    }
                });
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
