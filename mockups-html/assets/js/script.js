// Fake fetch + render para demo (única versión corregida)
(function(){
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // Simula un fetch a la API con latencia y posibilidad de error
  function fakeFetch(resource) {
    return new Promise((resolve, reject) => {
      const latency = 400 + Math.random() * 800;
      setTimeout(() => {
        if (Math.random() < 0.02) return reject(new Error('Network error'));

        const fakeData = {
          dashboard: {
            saldoTotal: 12345678,
            cargosPendientes: 1234,
            pagosMes: 1234567,
            reservasHoy: 4,
            actualizado: new Date().toISOString().slice(0,10)
          },
          unidades: [
            { id: 'A-101', name: 'A-101' },
            { id: 'B-202', name: 'B-202' },
            { id: 'C-303', name: 'C-303' }
          ],
          cargos: [
            { unidad: 'A-101', periodo: '2025-08', concepto: 'Gasto común', monto: 45000, estado: 'Pendiente' },
            { unidad: 'B-202', periodo: '2025-08', concepto: 'Consumo agua', monto: 12000, estado: 'Pagado' },
            { unidad: 'C-303', periodo: '2025-08', concepto: 'Reparación', monto: 78000, estado: 'Pendiente' }
          ],
          actividad: [
            { text: 'Pago TBK-12345 conciliado' },
            { text: 'Reserva amenidad aprobada' },
            { text: 'Se cargó emisión 2025-08' }
          ]
        };

        resolve(fakeData[resource]);
      }, latency);
    });
  }

  function formatMoney(n) {
    return '$ ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function removeLoaders(container) {
    if (!container) return;
    const loaders = container.querySelectorAll('.is-loading');
    loaders.forEach(el => el.remove());
  }

  function fadeIn(el) {
    if (!el) return;
    el.classList.add('fade-in');
    setTimeout(() => el.classList.remove('fade-in'), 800);
  }

  async function renderDashboard() {
    try {
      const d = await fakeFetch('dashboard');
      const tSaldo = document.getElementById('saldo-total');
      if (tSaldo) { tSaldo.textContent = formatMoney(d.saldoTotal); fadeIn(tSaldo); }

      const tCargos = document.getElementById('cargos-pendientes');
      if (tCargos) { tCargos.textContent = d.cargosPendientes; fadeIn(tCargos); }

      const tPagos = document.getElementById('pagos-mes');
      if (tPagos) { tPagos.textContent = formatMoney(d.pagosMes); fadeIn(tPagos); }

      const tRes = document.getElementById('reservas-hoy');
      if (tRes) { tRes.textContent = d.reservasHoy; fadeIn(tRes); }

      const tAct = document.getElementById('saldo-actualizado');
      if (tAct) { tAct.textContent = 'Última actualización: ' + d.actualizado; fadeIn(tAct); }
    } catch (err) {
      console.error('renderDashboard error', err);
    }
  }

  async function renderUnidades() {
    try {
      const unidades = await fakeFetch('unidades');
      const select = document.getElementById('select-unidad');
      if (!select) return;
      select.innerHTML = '';
      unidades.forEach(u => {
        const opt = document.createElement('option'); opt.value = u.id; opt.textContent = u.name; select.appendChild(opt);
      });
      fadeIn(select);
    } catch (err) {
      console.error('renderUnidades error', err);
    }
  }

  async function renderCargos() {
    try {
      const cargos = await fakeFetch('cargos');
      const tbody = document.getElementById('tabla-cargos-body');
      if (!tbody) return;
      removeLoaders(tbody);
      cargos.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${c.unidad}</td>
          <td>${c.periodo}</td>
          <td>${c.concepto}</td>
          <td class="text-end">${formatMoney(c.monto)}</td>
          <td><span class="status-pill ${c.estado === 'Pagado' ? 'status-paid' : 'status-pending'}">${c.estado}</span></td>
          <td class="text-end"><button class="btn btn-sm btn-outline-primary"><span class="material-icons">payment</span></button></td>
        `;
        tbody.appendChild(tr);
        fadeIn(tr);
      });
    } catch (err) {
      console.error('renderCargos error', err);
    }
  }

  async function renderActividad() {
    try {
      const actividad = await fakeFetch('actividad');
      const list = document.getElementById('actividad-list');
      if (!list) return;
      removeLoaders(list);
      actividad.forEach(a => {
        const li = document.createElement('li'); li.className = 'mb-2';
        li.innerHTML = `<span class="material-icons text-muted align-middle">history</span> <small class="muted ms-2">${a.text}</small>`;
        list.appendChild(li);
        fadeIn(li);
      });
    } catch (err) {
      console.error('renderActividad error', err);
    }
  }

  // form handler: add a local row (no persistence)
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-multa');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const unidad = document.getElementById('select-unidad')?.value || '';
        const motivo = document.getElementById('input-motivo')?.value || '';
        const monto = parseInt(document.getElementById('input-monto')?.value || '0', 10);
        const tbody = document.getElementById('tabla-cargos-body');
        if (!tbody) return;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${unidad}</td>
          <td>${new Date().toISOString().slice(0,7)}</td>
          <td>${motivo}</td>
          <td class="text-end">${formatMoney(monto)}</td>
          <td><span class="status-pill status-pending">Pendiente</span></td>
          <td class="text-end"><button class="btn btn-sm btn-outline-primary"><span class="material-icons">payment</span></button></td>
        `;
        tbody.prepend(tr);
        fadeIn(tr);
        form.reset();
      });
    }

    // initial render
    renderDashboard();
    renderUnidades();
    renderCargos();
    renderActividad();
  });

})();
