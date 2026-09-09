// CONFIGURAÇÃO DO SEU NÚMERO DE WHATSAPP (com DDD)
const TELEFONE_PETSHOP = "5583982172646";

// IMPORTANTE: Usamos 'focinho_cart' para unificar com a página de serviços e produtos!
let cart = JSON.parse(localStorage.getItem('focinho_cart')) || [];
let activeProductForDetail = null;

// Elementos do Carrinho
const cartFloatBtn = document.getElementById('cart-float-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartCount = document.getElementById('cart-count');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp-btn');

// Elementos do Modal de Detalhes
const productDetailModal = document.getElementById('product-detail-modal');
const closeDetailBtn = document.getElementById('close-detail-btn');
const detailTitle = document.getElementById('detail-title');
const detailIcon = document.getElementById('detail-icon');
const detailDesc = document.getElementById('detail-desc');
const detailPrice = document.getElementById('detail-price');
const detailAddCartBtn = document.getElementById('detail-add-cart-btn');

document.addEventListener('DOMContentLoaded', () => {
  updateCart();
  initPhoneValidation();
});

// --- MÁSCARA E VALIDAÇÃO DE APENAS NÚMEROS NO TELEFONE ---
function initPhoneValidation() {
  const tutorPhoneInput = document.getElementById('tutor-phone');
  if (!tutorPhoneInput) return;

  tutorPhoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    e.target.value = value;
  });
}

// --- SALVAR/CARREGAR CARRINHO NO LOCALSTORAGE ---
function saveCart() {
  localStorage.setItem('focinho_cart', JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  if (!cartCount || !cartItemsList || !cartTotalPrice) return;

  cartCount.innerText = cart.length;
  cartItemsList.innerHTML = '';
  
  let total = 0;
  
  cart.forEach((item, index) => {
    total += item.preco;
    const li = document.createElement('li');
    li.style.cssText = "padding: 12px 0; border-bottom: 1px solid #E2E8F0; position: relative;";

    // Verificação se é um serviço com pets ou um produto normal
    if (item.tipo === 'servico') {
      let petsNomes = item.pets && item.pets.length > 0 ? item.pets.map(p => p.name).join(', ') : 'Pet não informado';

      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span style="background: #FF6B35; color: #FFF; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">AGENDAMENTO</span>
            <h4 style="margin: 4px 0; font-size: 15px; color: #0A2540;">${item.nomeServico}</h4>
            <p style="margin: 2px 0; font-size: 13px; color: #475569;">🐾 <strong>Pet(s):</strong> ${petsNomes}</p>
            <p style="margin: 0; font-weight: bold; color: #FF6B35; font-size: 14px;">${item.precoFormatado || 'R$ ' + item.preco.toFixed(2).replace('.', ',')}</p>
          </div>
          <button class="remove-item-btn" onclick="removeItem(${index})" style="background: none; border: none; color: #EF4444; cursor: pointer; font-size: 18px;" title="Remover">&times;</button>
        </div>
      `;
    } else {
      // Produto normal da loja
      let imagemItem = item.img;
      if (!imagemItem && item.id) {
        const cardNaTela = document.querySelector(`.product-card[data-id="${item.id}"]`);
        if (cardNaTela) {
          imagemItem = cardNaTela.dataset.img || (cardNaTela.querySelector('img') ? cardNaTela.querySelector('img').src : '');
        }
      }

      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";

      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${imagemItem || ''}" alt="${item.nome}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px; border: 1px solid #CBD5E1;">
          <span style="font-size: 14px; font-weight: 500; color: #0A2540;">${item.nome}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <strong style="font-size: 14px;">R$ ${item.preco.toFixed(2).replace('.', ',')}</strong>
          <button class="remove-item-btn" onclick="removeItem(${index})" style="background: none; border: none; color: #EF4444; cursor: pointer; font-size: 18px;" title="Remover">&times;</button>
        </div>
      `;
    }

    cartItemsList.appendChild(li);
  });

  cartTotalPrice.innerText = total.toFixed(2).replace('.', ',');
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}

// --- ADICIONAR PRODUTO AO CARRINHO PELA PÁGINA ---
document.querySelectorAll('.btn-add-cart').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = e.target.closest('.product-card');
    addItemToCartFromCard(card);
  });
});

function addItemToCartFromCard(card) {
  const id = card.dataset.id;
  const nome = card.dataset.nome;
  const preco = parseFloat(card.dataset.preco);
  
  let img = card.dataset.img;
  if (!img) {
    const imgElement = card.querySelector('img');
    if (imgElement) img = imgElement.src;
  }

  cart.push({ tipo: 'produto', id, nome, preco, img }); 
  saveCart();

  if (cartFloatBtn) {
    cartFloatBtn.style.transform = 'scale(1.1)';
    setTimeout(() => cartFloatBtn.style.transform = 'scale(1)', 150);
  }
}

// --- MODAL DE DETALHES DO PRODUTO (AO CLICAR) ---
document.querySelectorAll('.clickable-product').forEach(el => {
  el.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    
    activeProductForDetail = card;
    detailTitle.innerText = card.dataset.nome;
    
    let imgUrl = card.dataset.img;
    if (!imgUrl) {
      const imgEl = card.querySelector('img');
      if (imgEl) imgUrl = imgEl.src;
    }

    if (detailIcon) {
      if (imgUrl) {
        detailIcon.innerHTML = `<img src="${imgUrl}" alt="${card.dataset.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
      } else {
        detailIcon.innerText = card.dataset.icone || '📦';
      }
    }

    detailDesc.innerText = card.dataset.desc;
    detailPrice.innerText = `R$ ${parseFloat(card.dataset.preco).toFixed(2).replace('.', ',')}`;

    productDetailModal.classList.remove('hidden');
  });
});

if (closeDetailBtn) {
  closeDetailBtn.addEventListener('click', () => productDetailModal.classList.add('hidden'));
  
  detailAddCartBtn.addEventListener('click', () => {
    if (activeProductForDetail) {
      addItemToCartFromCard(activeProductForDetail);
      productDetailModal.classList.add('hidden');
    }
  });
}

// --- FINALIZAR PEDIDO VIA WHATSAPP (MENSAGEM COMPLETA) ---
if (cartFloatBtn) {
  cartFloatBtn.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
  });
  
  closeCartBtn.addEventListener('click', () => cartModal.classList.add('hidden'));

  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.classList.add('hidden');
  });

  checkoutWhatsappBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    const profileData = JSON.parse(localStorage.getItem('focinho_profile')) || { tutor: {} };
    const tutor = profileData.tutor || {};

    let mensagem = `🛒 *NOVO PEDIDO / AGENDAMENTO — FOCINHO FELIZ*\n\n`;

    if (tutor.name) {
      mensagem += `👤 *Tutor(a):* ${tutor.name}\n`;
      if (tutor.phone) mensagem += `📞 *Telefone:* ${tutor.phone}\n\n`;
    }

    mensagem += `*ITENS SOLICITADOS:*\n`;
    
    let total = 0;
    cart.forEach((item, index) => {
      if (item.tipo === 'servico') {
        mensagem += `\n${index + 1}. *Serviço:* ${item.nomeServico} (${item.precoFormatado || 'R$ ' + item.preco.toFixed(2).replace('.', ',')})\n`;
        if (item.pets && item.pets.length > 0) {
          item.pets.forEach(p => {
            mensagem += `   🐾 *Pet:* ${p.name}\n`;
            if (p.type) mensagem += `     - Raça/Espécie: ${p.type}\n`;
            if (p.size) mensagem += `     - Porte: ${p.size}\n`;
            if (p.age) mensagem += `     - Idade: ${p.age}\n`;
            if (p.weight) mensagem += `     - Peso: ${p.weight}kg\n`;
          });
        }
        total += item.preco;
      } else {
        mensagem += `\n${index + 1}. *Produto:* ${item.nome} — R$ ${item.preco.toFixed(2).replace('.', ',')}\n`;
        total += item.preco;
      }
    });

    mensagem += `\n💰 *Total Geral: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    mensagem += `Olá! Gostaria de confirmar estes itens e agendamentos.`;

    const urlWhatsapp = `https://wa.me/${TELEFONE_PETSHOP}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsapp, '_blank');
  });
}