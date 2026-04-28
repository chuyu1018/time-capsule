/* 360° 全景查看器 —— Pannellum 封装 */

let currentViewer = null;

export function loadPanorama(round) {
  // 清掉上一关
  if (currentViewer) {
    try { currentViewer.destroy(); } catch (e) { /* ignore */ }
    currentViewer = null;
  }
  const el = document.getElementById('viewer');
  el.innerHTML = '';

  if (!window.pannellum) {
    el.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(244,236,216,.6);font-family:Songti SC,serif;">全景库未加载</div>';
    return;
  }

  const config = {
    type: round.panoramaType || 'equirectangular',
    panorama: round.panoramaUrl,
    autoLoad: true,
    showControls: false,
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    autoRotate: -1.5,
    autoRotateInactivityDelay: 4000,
    hfov: 100,
    minHfov: 50,
    maxHfov: 120,
    compass: false,
    crossOrigin: 'anonymous',
    backgroundColor: [10, 6, 6]
  };

  currentViewer = window.pannellum.viewer('viewer', config);
}

export function destroyViewer() {
  if (currentViewer) {
    try { currentViewer.destroy(); } catch (e) { /* ignore */ }
    currentViewer = null;
  }
}
