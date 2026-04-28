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

  const isPartial = round.panoramaType === 'partial' || round.panoramaType === 'cylinder';

  const config = {
    type: 'equirectangular',
    panorama: round.panoramaUrl,
    autoLoad: true,
    showControls: false,
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    autoRotate: isPartial ? 0 : -1.5,
    autoRotateInactivityDelay: 4000,
    hfov: 90,
    minHfov: 40,
    maxHfov: 110,
    compass: false,
    crossOrigin: 'anonymous',
    backgroundColor: [10, 6, 6]
  };

  // Partial / 非 2:1 图片：限制视角范围，避免上下被拉伸 + 左右接缝错位
  if (isPartial) {
    Object.assign(config, {
      haov: round.haov || 220,   // 水平视角范围（度）
      vaov: round.vaov || 110,   // 垂直视角范围
      vOffset: round.vOffset || 0,
      minPitch: -50,
      maxPitch: 50,
      minYaw: -110,
      maxYaw: 110
    });
  }

  currentViewer = window.pannellum.viewer('viewer', config);
}

export function destroyViewer() {
  if (currentViewer) {
    try { currentViewer.destroy(); } catch (e) { /* ignore */ }
    currentViewer = null;
  }
}
