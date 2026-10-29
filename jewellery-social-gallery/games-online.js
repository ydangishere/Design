(() => {
  'use strict';
  const posters = [
  {
    "title": "2 Wild 2 Die",
    "image": "assets/games-online/2Wild2Die_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Aiko and the Wind Spirit",
    "image": "assets/games-online/AikoAndTheWindSpirit_thumb_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Born Wild",
    "image": "assets/games-online/BornWild_Thumb_500x500.png",
    "width": 500,
    "height": 500
  },
  {
    "title": "Bullets and Bounty",
    "image": "assets/games-online/BulletsAndBounty_thumb_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Fred’s Food Truck",
    "image": "assets/games-online/Fred_sFoodTruck_thumb_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Hand of Anubis",
    "image": "assets/games-online/HandOfAnubis_Thumb_500x500.png",
    "width": 500,
    "height": 500
  },
  {
    "title": "Le Viking",
    "image": "assets/games-online/LeViking_thumb_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Outlaws",
    "image": "assets/games-online/Outlaws_Thumb_500x500.png",
    "width": 500,
    "height": 500
  },
  {
    "title": "Rotten",
    "image": "assets/games-online/Rotten_Thumb_500x500.png",
    "width": 500,
    "height": 500
  },
  {
    "title": "Six Six Six",
    "image": "assets/games-online/SixSixSix_thumb_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Stormforged",
    "image": "assets/games-online/Stormforged_thumb_500x500.png",
    "width": 500,
    "height": 500
  },
  {
    "title": "The Luxe",
    "image": "assets/games-online/TheLuxe_thumb_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Chaos Crew",
    "image": "assets/games-online/Thumb_500x500.png",
    "width": 500,
    "height": 500
  },
  {
    "title": "Tiger Legends",
    "image": "assets/games-online/TigerLegends_thumb_512x512.png",
    "width": 512,
    "height": 512
  },
  {
    "title": "Ze Zeus",
    "image": "assets/games-online/ZeZeus_thumb_512x512.png",
    "width": 512,
    "height": 512
  }
];
  const grid = document.getElementById('games-grid');
  if (!grid) return;
  let selected = 0, opener, previousOverflow = '';
  const dialog = document.createElement('dialog');
  dialog.className = 'other-lightbox games-lightbox';
  dialog.setAttribute('aria-labelledby', 'games-lightbox-title');
  dialog.innerHTML = `<div class="other-lightbox-bar"><p id="games-lightbox-index"></p><button type="button" class="other-lightbox-close" aria-label="Đóng poster game">×</button></div>
    <div class="other-lightbox-layout"><div class="other-image-viewport" tabindex="0" aria-label="Vùng xem poster game"><img alt=""><p class="other-image-status" role="status" hidden></p></div>
    <div class="other-lightbox-details"><h2 id="games-lightbox-title"></h2><p id="games-lightbox-meta"></p><button type="button" class="other-action games-zoom" aria-pressed="false">Phóng to 2×</button><a class="other-action other-download" download>Tải PNG gốc ↓</a><div class="other-lightbox-nav"><button type="button" class="other-action games-prev" aria-label="Poster game trước">← Trước</button><button type="button" class="other-action games-next" aria-label="Poster game tiếp theo">Tiếp →</button></div><p>Dùng ← → để chuyển poster, Esc để đóng.</p></div></div>`;
  document.body.appendChild(dialog);
  const image = dialog.querySelector('img');
  const viewport = dialog.querySelector('.other-image-viewport');
  const zoom = dialog.querySelector('.games-zoom');
  const status = dialog.querySelector('.other-image-status');
  function resetZoom() {
    viewport.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Phóng to 2×';
    viewport.scrollTo(0, 0);
  }
  function showPoster(index) {
    selected = (index + posters.length) % posters.length;
    const poster = posters[selected];
    resetZoom();
    image.hidden = false;
    status.hidden = true;
    image.src = poster.image;
    image.alt = poster.title + ' — game poster';
    viewport.style.setProperty('--other-zoom-width', `${poster.width * 2}px`);
    dialog.querySelector('#games-lightbox-title').textContent = poster.title;
    dialog.querySelector('#games-lightbox-index').textContent = `${selected + 1} / ${posters.length} — Games Online`;
    dialog.querySelector('#games-lightbox-meta').textContent = `${poster.width} × ${poster.height} px · PNG gốc`;
    const download = dialog.querySelector('.other-download');
    download.href = poster.image;
    download.download = poster.image.split('/').pop();
  }
  posters.forEach((poster, index) => {
    const card = document.createElement('article');
    card.className = 'card';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cardbutton';
    button.setAttribute('aria-label', 'Xem poster ' + poster.title);
    const frame = document.createElement('div');
    frame.className = 'poster';
    const preview = document.createElement('img');
    Object.assign(preview, {src: poster.image, alt: poster.title + ' — game poster', width: poster.width, height: poster.height, loading: 'lazy', decoding: 'async'});
    frame.appendChild(preview);
    button.appendChild(frame);
    button.addEventListener('click', () => {
      opener = button;
      showPoster(index);
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      dialog.querySelector('.other-lightbox-close').focus();
    });
    const meta = document.createElement('div');
    meta.className = 'cardmeta';
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = poster.title;
    const size = document.createElement('p');
    size.textContent = `PNG · ${poster.width} × ${poster.height}`;
    const download = document.createElement('a');
    download.className = 'games-download';
    download.textContent = 'Tải PNG ↓';
    download.href = poster.image;
    download.download = poster.image.split('/').pop();
    download.setAttribute('aria-label', 'Tải poster ' + poster.title);
    copy.append(title, size, download);
    const number = document.createElement('span');
    number.className = 'num';
    number.textContent = String(index + 1).padStart(2, '0');
    meta.append(copy, number);
    card.append(button, meta);
    grid.appendChild(card);
  });
  image.addEventListener('load', () => { status.hidden = true; });
  image.addEventListener('error', () => {
    image.hidden = true;
    status.hidden = false;
    status.textContent = 'Không mở được ảnh. Hãy tải lại trang hoặc tải file PNG.';
  });
  dialog.querySelector('.other-lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.games-prev').addEventListener('click', () => showPoster(selected - 1));
  dialog.querySelector('.games-next').addEventListener('click', () => showPoster(selected + 1));
  zoom.addEventListener('click', () => {
    const enlarged = viewport.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? 'Vừa khung ảnh' : 'Phóng to 2×';
    viewport.scrollTo(0, 0);
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (viewport.classList.contains('is-zoomed')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      showPoster(selected + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    resetZoom();
    if (opener?.isConnected) opener.focus();
  });
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });
  document.querySelectorAll('#collection-tabs [data-collection]').forEach(tab => {
    tab.addEventListener('click', () => { if (dialog.open) dialog.close(); });
  });
})();
