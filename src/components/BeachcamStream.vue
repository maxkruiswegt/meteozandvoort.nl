<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type Player from 'video.js/dist/types/player';

const videoRef = ref<HTMLVideoElement | null>(null);
let player: Player | null = null;

const streamUrl = 'https://wowza01.crossmediaventures.com/beachcam/beachcam.smil/playlist.m3u8';

// video.js is ~0.5 MB; load it on demand so it stays out of the initial bundle.
onMounted(async () => {
  const [{ default: videojs }] = await Promise.all([import('video.js'), import('video.js/dist/video-js.css')]);
  if (!videoRef.value) return;
  player = videojs(videoRef.value, {
    controls: true,
    autoplay: 'muted',
    muted: true,
    preload: 'auto',
    fluid: true,
    liveui: true,
    controlBar: {
      volumePanel: false, // stream has no audio
    },
    sources: [
      {
        src: streamUrl,
        type: 'application/x-mpegURL',
      },
    ],
  });

  // Muted autoplay is allowed without a gesture, but needs an explicit kick
  // once the player is ready (matches pre-overhaul behavior).
  player.ready(() => {
    player?.play()?.catch(() => {
      /* autoplay blocked; the play button remains */
    });
  });

  // Chrome pauses video-only media in hidden tabs; resume when the tab
  // becomes visible again.
  document.addEventListener('visibilitychange', resumeWhenVisible);
});

const resumeWhenVisible = () => {
  if (!document.hidden && player?.paused()) {
    player.play()?.catch(() => {});
  }
};

onUnmounted(() => {
  document.removeEventListener('visibilitychange', resumeWhenVisible);
  player?.dispose();
  player = null;
});
</script>

<template>
  <div class="beachcam">
    <video
      ref="videoRef"
      class="video-js vjs-big-play-centered"
      playsinline
    ></video>
    <p class="beachcam-credit">
      Livestream door
      <a
        href="https://reddingsbrigade-bloemendaal.nl/beachcam/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Reddingsbrigade Bloemendaal
      </a>
    </p>
  </div>
</template>

<style scoped>
.beachcam {
  width: 100%;
}

.beachcam :deep(.video-js) {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-tile);
  overflow: hidden;
  background: var(--bg-raised);
}

.beachcam-credit {
  text-align: center;
  margin-top: 0.625rem;
  font-size: 0.75rem;
  color: var(--text-faint);
}
</style>
