<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const videoRef = ref(null);
let player = null;

const streamUrl = 'https://wowza01.crossmediaventures.com/beachcam/beachcam.smil/playlist.m3u8';

onMounted(() => {
  if (videoRef.value) {
    player = videojs(videoRef.value, {
      controls: true,
      autoplay: true,
      muted: true,
      preload: 'auto',
      fluid: true,
      liveui: true,
      controlBar: {
        volumePanel: false, // Hide volume control (no audio in stream)
      },
      sources: [
        {
          src: streamUrl,
          type: 'application/x-mpegURL',
        },
      ],
    });

    // Auto-play
    player.ready(() => {
      player.play().catch((err) => {
        console.log('Autoplay prevented:', err);
      });
    });
  }
});

onUnmounted(() => {
  if (player) {
    player.dispose();
  }
});
</script>

<template>
  <div class="beachcam-container">
    <video
      ref="videoRef"
      class="video-js vjs-big-play-centered"
    ></video>
    <div class="beachcam-credit">
      <small>
        Livestream door
        <a
          href="https://reddingsbrigade-bloemendaal.nl/beachcam/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reddingsbrigade Bloemendaal
        </a>
      </small>
    </div>
  </div>
</template>

<style scoped>
.beachcam-container {
  width: 100%;
}

.beachcam-credit {
  text-align: center;
  margin-top: 0.5rem;
  opacity: 0.8;
  font-size: 0.875rem;
}

.beachcam-credit a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.beachcam-credit a:hover {
  text-decoration: underline;
}

/* Video.js responsive container */
.video-js {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
}
</style>
