document.addEventListener('DOMContentLoaded', function() {
    // Load YouTube IFrame API
    if (!window.YT) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    var players = {};
    var apiReady = false;

    // Initialize players when API is ready
    window.onYouTubeIframeAPIReady = function() {
        apiReady = true;
        initAllPlayers();
    };

    function initAllPlayers() {
        if (!apiReady) return;
        
        document.querySelectorAll('[id^="youtube-player"]').forEach(function(playerElement) {
            var playerId = playerElement.id;
            var moduleId = playerId.replace('youtube-player', '');
            
            if (!players[moduleId]) {
                players[moduleId] = new YT.Player(playerId, {
                    height: '100%',
                    width: '100%',
                    playerVars: {
                        'autoplay': 1,
                        'rel': 0,
                        'modestbranding': 1
                    }
                });
            }
        });
    }

    // If API is already loaded (e.g. from another script)
    if (window.YT && window.YT.Player) {
        apiReady = true;
        initAllPlayers();
    }

    // Add click handlers to video items
    document.querySelectorAll('.video-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var videoId = this.dataset.videoId;
            var videoTitle = this.dataset.videoTitle || 'Video Player';
            var videoDescription = this.dataset.videoDescription || '';
            var targetModalId = this.dataset.bsTarget;
            
            if (!videoId) {
                console.error('No video ID found for this item');
                return;
            }

            if (!targetModalId) {
                console.error('No target modal found for this item');
                return;
            }

            var moduleId = targetModalId.replace('#videoModal', '');
            var modal = document.querySelector(targetModalId);

            if (!modal) {
                console.error('Video modal element not found: ' + targetModalId);
                return;
            }

            // Update modal title
            var modalTitle = document.getElementById('videoModalLabel' + moduleId);
            if (modalTitle) {
                modalTitle.textContent = videoTitle;
            }

            // Update video description
            var descriptionContainer = document.getElementById('video-description-container' + moduleId);
            var descriptionContent = document.getElementById('video-description-content' + moduleId);
            
            if (descriptionContainer && descriptionContent) {
                if (videoDescription && videoDescription.trim() !== '') {
                    // Convert line breaks to <br> tags and preserve formatting
                    var formattedDescription = videoDescription
                        .replace(/\n/g, '<br>')
                        .replace(/\r/g, '');
                    
                    descriptionContent.innerHTML = formattedDescription;
                    descriptionContainer.style.display = 'block';
                } else {
                    descriptionContainer.style.display = 'none';
                }
            }

            // Initialize player if not already done
            if (apiReady && players[moduleId]) {
                players[moduleId].loadVideoById(videoId);
            } else if (apiReady) {
                // Try initializing it now if it was missed
                initAllPlayers();
                if (players[moduleId]) {
                    players[moduleId].loadVideoById(videoId);
                }
            } else {
                console.warn('YouTube player not ready yet');
            }

            // Show modal
            var modalInstance = bootstrap.Modal.getOrCreateInstance(modal);
            modalInstance.show();
        });
    });

    // Stop video when modals are closed
    document.querySelectorAll('.modal[id^="videoModal"]').forEach(function(modal) {
        modal.addEventListener('hidden.bs.modal', function() {
            var moduleId = this.id.replace('videoModal', '');
            if (players[moduleId] && typeof players[moduleId].stopVideo === 'function') {
                players[moduleId].stopVideo();
            }
        });
    });

    // Handle Clear button functionality (generic for search forms)
    var clearButtons = document.querySelectorAll('.filter-search-actions .btn, .filter-search-actions button, .btn-clear');
    clearButtons.forEach(function(clearButton) {
        clearButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            var form = this.closest('form');
            if (form) {
                var searchInput = form.querySelector('.filter-search, input[name="filter[search]"]');
                if (searchInput) {
                    searchInput.value = '';
                }
                form.submit();
            } else {
                // Fallback: reload the page if no form found
                window.location.href = window.location.pathname;
            }
        });
    });
});
