// Talyon · caroselli Instagram · cornice comune
// Per ogni <section class="slide" data-tipo="..."> aggiunge grana, angolari in rame,
// logotipo, contatore "NN / TT" e piede ("Scorri" o, sull'ultima, "Salva il post").
// Raggruppa etichetta, titolo e sottotitolo e, nella chiusura, aggiunge simbolo e linea in rame.
(function () {
  var body = document.body;
  var serie = body.getAttribute('data-serie') || '';

  var defs = '' +
    '<svg width="0" height="0" style="position:absolute;overflow:hidden" aria-hidden="true"><defs>' +
    '<linearGradient id="cuBar" gradientUnits="userSpaceOnUse" x1="0" y1="22.6" x2="0" y2="28.6"><stop offset="0" stop-color="#B26A2C"/><stop offset="0.1" stop-color="#F2B879"/><stop offset="0.24" stop-color="#FFE7CC"/><stop offset="0.4" stop-color="#F2B879"/><stop offset="0.58" stop-color="#D98E4A"/><stop offset="0.76" stop-color="#B26A2C"/><stop offset="0.9" stop-color="#6B3A17"/><stop offset="1" stop-color="#9A5A28"/></linearGradient>' +
    '<linearGradient id="cuRim" gradientUnits="userSpaceOnUse" x1="51.5" y1="85.5" x2="68.5" y2="102.5"><stop offset="0" stop-color="#FFE7CC"/><stop offset="0.28" stop-color="#F2B879"/><stop offset="0.55" stop-color="#D98E4A"/><stop offset="0.8" stop-color="#8C5424"/><stop offset="1" stop-color="#5E3414"/></linearGradient>' +
    '<linearGradient id="cuFace" gradientUnits="userSpaceOnUse" x1="53" y1="87" x2="67" y2="101"><stop offset="0" stop-color="#7A4520"/><stop offset="0.38" stop-color="#B26A2C"/><stop offset="0.52" stop-color="#E3A265"/><stop offset="0.57" stop-color="#FFE2C0"/><stop offset="0.63" stop-color="#E3A265"/><stop offset="0.85" stop-color="#F2B879"/><stop offset="1" stop-color="#FFE7CC"/></linearGradient>' +
    '<linearGradient id="wmBar" gradientUnits="userSpaceOnUse" x1="0" y1="-5.2" x2="0" y2="0"><stop offset="0" stop-color="#B26A2C"/><stop offset="0.1" stop-color="#F2B879"/><stop offset="0.24" stop-color="#FFE7CC"/><stop offset="0.4" stop-color="#F2B879"/><stop offset="0.58" stop-color="#D98E4A"/><stop offset="0.76" stop-color="#B26A2C"/><stop offset="0.9" stop-color="#6B3A17"/><stop offset="1" stop-color="#9A5A28"/></linearGradient>' +
    '<linearGradient id="wmRim" gradientUnits="userSpaceOnUse" x1="110.8" y1="40.9" x2="122.2" y2="52.3"><stop offset="0" stop-color="#FFE7CC"/><stop offset="0.28" stop-color="#F2B879"/><stop offset="0.55" stop-color="#D98E4A"/><stop offset="0.8" stop-color="#8C5424"/><stop offset="1" stop-color="#5E3414"/></linearGradient>' +
    '<linearGradient id="wmFace" gradientUnits="userSpaceOnUse" x1="112" y1="42.1" x2="121" y2="51.1"><stop offset="0" stop-color="#7A4520"/><stop offset="0.38" stop-color="#B26A2C"/><stop offset="0.52" stop-color="#E3A265"/><stop offset="0.57" stop-color="#FFE2C0"/><stop offset="0.63" stop-color="#E3A265"/><stop offset="0.85" stop-color="#F2B879"/><stop offset="1" stop-color="#FFE7CC"/></linearGradient>' +
    '<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>' +
    '<symbol id="mark" viewBox="0 0 120 120">' +
    '<path d="M26.98 22.6L20 22.6A3 3 0 0 0 20 28.6L28.62 28.6ZM40.19 22.6L79.81 22.6L78.68 28.6L41.32 28.6ZM93.02 22.6L100 22.6A3 3 0 0 1 100 28.6L91.38 28.6Z" fill="url(#cuBar)"/>' +
    '<path d="M50.5 94.01a9.5 9.5 0 1 0 19 0a9.5 9.5 0 1 0 -19 0ZM57.7 94.01a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" fill="url(#cuRim)" fill-rule="evenodd"/>' +
    '<path d="M52.4 94.01a7.6 7.6 0 1 0 15.2 0a7.6 7.6 0 1 0 -15.2 0ZM56.6 94.01a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z" fill="url(#cuFace)" fill-rule="evenodd"/>' +
    '<path d="M60 55.55L42.55 43.13L38.13 19.8A5 5 0 0 0 28.39 22.05L35.03 46.36A4 4 0 0 0 36.63 48.73L51.76 59.16L54.66 84.4A11 11 0 0 1 65.34 84.4L68.24 59.16L83.37 48.73A4 4 0 0 0 84.97 46.36L91.61 22.05A5 5 0 0 0 81.87 19.8L77.45 43.13Z" fill="currentColor"/>' +
    '</symbol>' +
    '<symbol id="word" viewBox="-2 -12 225.2 67">' +
    '<path d="M95.16 -5.2L93.09 -5.2A2.6 2.6 0 0 0 93.09 0L96.52 0ZM106.15 -5.2L126.83 -5.2L125.79 0L107.19 0ZM137.82 -5.2L139.89 -5.2A2.6 2.6 0 0 1 139.89 0L136.46 0Z" fill="url(#wmBar)"/>' +
    '<path d="M110.09 46.6a6.4 6.4 0 1 0 12.8 0a6.4 6.4 0 1 0 -12.8 0ZM114.89 46.6a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z" fill="url(#wmRim)" fill-rule="evenodd"/>' +
    '<path d="M111.39 46.6a5.1 5.1 0 1 0 10.2 0a5.1 5.1 0 1 0 -10.2 0ZM114.09 46.6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z" fill="url(#wmFace)" fill-rule="evenodd"/>' +
    '<path d="M0 0L36 0L36 6.4L21.6 6.4L21.6 40L14.4 40L14.4 6.4L0 6.4ZM31.85 40L48.15 0L55.55 0L71.85 40L64.29 40L60.87 31.6L42.83 31.6L39.41 40ZM51.85 9.47L58.34 25.4L45.36 25.4ZM76.1 0L83.3 0L83.3 33.6L103.1 33.6L103.1 40L76.1 40ZM187.19 0L195.52 0L213.99 28.78L213.99 0L221.19 0L221.19 40L212.86 40L194.39 11.22L194.39 40L187.19 40ZM138.54 20a20.6 20.6 0 1 0 41.2 0a20.6 20.6 0 1 0 -41.2 0ZM145.94 20a13.2 13.2 0 1 0 26.4 0a13.2 13.2 0 1 0 -26.4 0Z" fill="currentColor" fill-rule="evenodd"/>' +
    '<path d="M116.49 17.6L108.16 11L104.44 -7.65A4.2 4.2 0 0 0 96.25 -5.76L101.38 13.81A3.6 3.6 0 0 0 102.68 15.84L111.99 23.01L112.79 39.97A7.6 7.6 0 0 1 120.19 39.97L120.99 23.01L130.3 15.84A3.6 3.6 0 0 0 131.6 13.81L136.73 -5.76A4.2 4.2 0 0 0 128.54 -7.65L124.82 11Z" fill="currentColor"/>' +
    '</symbol>' +
    '</defs></svg>';
  body.insertAdjacentHTML('afterbegin', defs);

  var freccia = '<svg width="34" height="16" viewBox="0 0 34 16" fill="none" aria-hidden="true"><path d="M1 8H32M25 1L32 8L25 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var slides = Array.prototype.slice.call(document.querySelectorAll('section.slide'));
  var tot = String(slides.length).padStart(2, '0');

  slides.forEach(function (s, i) {
    var tipo = s.getAttribute('data-tipo') || 'contenuto';
    s.setAttribute('data-tipo', tipo);
    var cont = document.createElement('div');
    cont.className = 'contenuto';
    while (s.firstChild) cont.appendChild(s.firstChild);

    if (tipo !== 'chiusura') {
      var sel = tipo === 'copertina' ? '.etichetta, h1, .sottotitolo' : '.etichetta, h1';
      var parti = Array.prototype.filter.call(cont.children, function (el) { return el.matches(sel); });
      if (parti.length) {
        var gruppo = document.createElement('div');
        gruppo.className = 'blocco-titolo';
        cont.insertBefore(gruppo, parti[0]);
        parti.forEach(function (p) { gruppo.appendChild(p); });
      }
    } else {
      cont.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 120 120" width="280" height="280" role="img" aria-label="Simbolo Talyon" style="color:#FFFFFF;flex-shrink:0"><use href="#mark"></use></svg>');
      var invito = cont.querySelector('.invito');
      if (invito && !cont.querySelector('.linea')) {
        var linea = document.createElement('div');
        linea.className = 'linea';
        invito.parentNode.insertBefore(linea, invito);
      }
    }

    var n = String(i + 1).padStart(2, '0');
    var ultima = i === slides.length - 1;
    s.innerHTML =
      '<svg class="grana" width="1080" height="1350" viewBox="0 0 1080 1350" aria-hidden="true"><rect width="1080" height="1350" filter="url(#grain)"></rect></svg>' +
      '<div class="angolo tl"></div><div class="angolo tr"></div><div class="angolo bl"></div><div class="angolo br"></div>' +
      '<div class="testata"><svg viewBox="0 0 225.2 67" width="136" height="40" role="img" aria-label="Talyon" style="color:#FFFFFF"><use href="#word"></use></svg>' +
      '<div class="contatore">' + n + ' / ' + tot + '</div></div>';
    s.appendChild(cont);
    s.insertAdjacentHTML('beforeend',
      '<div class="piede"><span>' + serie + '</span>' +
      (ultima ? '<span>Salva il post</span>' : '<div class="scorri"><span>Scorri</span>' + freccia + '</div>') +
      '</div>');
  });
  // Annotazioni: un elemento con data-mira="id" si allinea in verticale al centro dell'elemento con quell'id
  // (posizione calcolata rispetto al suo contenitore con position: relative).
  function posiziona() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-mira]'), function (a) {
      var bersaglio = document.getElementById(a.getAttribute('data-mira'));
      var base = a.offsetParent;
      if (!bersaglio || !base) return;
      var rt = bersaglio.getBoundingClientRect();
      var rb = base.getBoundingClientRect();
      a.style.top = (rt.top + rt.height / 2 - rb.top) + 'px';
    });
    body.setAttribute('data-pronto', '1');
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(posiziona); else posiziona();
})();
