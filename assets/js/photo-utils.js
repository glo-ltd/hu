/* Shared in-browser photo processing for the client's profile photos.
 * The same steps as the women's profile photos (assets/js/profile.js):
 * rotate by EXIF orientation, resize to at most 1600 px on the long side and
 * re-encode as JPEG 0.82 with a canvas, which strips all metadata,
 * including GPS location. window.HUPhoto.process(file) -> Promise<Blob>.
 */
(function () {
  'use strict';
  var MAX_EDGE = 1600;
  var JPEG_QUALITY = 0.82;
  var MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
  var T = {
    unreadable: 'That file couldn\'t be read as a photo. Please choose a JPEG or PNG photo.',
    tooBig: 'That photo is too large. Please choose another.',
  };

  function readOrientation(buf) {
    try {
      var v = new DataView(buf);
      if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) return 1;
      var off = 2;
      while (off + 4 <= v.byteLength) {
        var marker = v.getUint16(off);
        if ((marker & 0xFF00) !== 0xFF00) return 1;
        var len = v.getUint16(off + 2);
        if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) { // "Exif"
          var tiff = off + 10;
          var little = v.getUint16(tiff) === 0x4949;
          var ifd = tiff + v.getUint32(tiff + 4, little);
          var n = v.getUint16(ifd, little);
          for (var i = 0; i < n; i++) {
            var e = ifd + 2 + i * 12;
            if (v.getUint16(e, little) === 0x0112) return v.getUint16(e + 8, little) || 1;
          }
          return 1;
        }
        if (marker === 0xFFDA) return 1;
        off += 2 + len;
      }
    } catch (e) {}
    return 1;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error(T.unreadable)); };
      img.src = src;
    });
  }

  function readBuffer(file) {
    if (file.arrayBuffer) return file.arrayBuffer();
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsArrayBuffer(file);
    });
  }

  function toBlob(canvas, quality) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) return canvas.toBlob(resolve, 'image/jpeg', quality);
      var bin = atob(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      resolve(new Blob([arr], { type: 'image/jpeg' }));
    });
  }

  // Newer browsers apply EXIF orientation when decoding an <img>; older ones
  // don't. Find out by decoding a tiny 2x1 JPEG tagged "rotate 90°".
  var autoOrientPromise = null;
  function browserAutoOrients() {
    if (autoOrientPromise) return autoOrientPromise;
    var c = document.createElement('canvas');
    c.width = 2; c.height = 1;
    autoOrientPromise = toBlob(c, 0.9).then(readBuffer).then(function (buf) {
      var src = new Uint8Array(buf);
      var app1 = [0xFF, 0xE1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08,
        0x00, 0x01, 0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
      var out = new Uint8Array(src.length + app1.length);
      out.set(src.subarray(0, 2), 0);
      out.set(app1, 2);
      out.set(src.subarray(2), 2 + app1.length);
      var url = URL.createObjectURL(new Blob([out], { type: 'image/jpeg' }));
      return loadImage(url).then(function (img) { URL.revokeObjectURL(url); return img.naturalWidth === 1; });
    }).catch(function () { return true; });
    return autoOrientPromise;
  }

  function processPhoto(file) {
    var url = URL.createObjectURL(file);
    return Promise.all([readBuffer(file), loadImage(url), browserAutoOrients()]).then(function (r) {
      URL.revokeObjectURL(url);
      var img = r[1];
      var o = r[2] ? 1 : readOrientation(r[0]);
      var w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) throw new Error(T.unreadable);
      var swap = o >= 5 && o <= 8;
      var ow = swap ? h : w, oh = swap ? w : h;
      var scale = Math.min(1, MAX_EDGE / Math.max(ow, oh));
      var cw = Math.max(1, Math.round(ow * scale)), ch = Math.max(1, Math.round(oh * scale));
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cw, ch);
      var xf = { 2: [-1, 0, 0, 1, cw, 0], 3: [-1, 0, 0, -1, cw, ch], 4: [1, 0, 0, -1, 0, ch], 5: [0, 1, 1, 0, 0, 0],
        6: [0, 1, -1, 0, cw, 0], 7: [0, -1, -1, 0, cw, ch], 8: [0, -1, 1, 0, 0, ch] }[o];
      if (xf) ctx.setTransform(xf[0], xf[1], xf[2], xf[3], xf[4], xf[5]);
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, swap ? ch : cw, swap ? cw : ch);
      return toBlob(canvas, JPEG_QUALITY).then(function (blob) {
        if (blob && blob.size > MAX_UPLOAD_BYTES) return toBlob(canvas, 0.7);
        return blob;
      });
    }, function (err) {
      URL.revokeObjectURL(url);
      throw err;
    }).then(function (blob) {
      if (!blob || blob.size > MAX_UPLOAD_BYTES) throw new Error(T.tooBig);
      return blob;
    });
  }

  window.HUPhoto = { process: processPhoto };
})();
