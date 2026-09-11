/**
 * ============================================================================
 * FOCINHO FELIZ - SCRIPT GLOBAL (CADASTRO + SERVIÇOS + CARRINHO)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initPhoneMasks();
  
  if (document.getElementById('complete-profile-form')) {
    initPetProfileSystem();
  }
  
  if (document.getElementById('service-modal')) {
    initServiceModalSystem();
  }
});

/* /* ============================================================================
 * 1. NAVEGAÇÃO MOBILE (MENU HAMBÚRGUER)
 * ============================================================================ */
function initMobileNavigation() {
  const navToggle = document.getElementById('navToggle') || document.getElementById('nav-toggle');
  const mainNav = document.getElementById('mainNav') || document.getElementById('main-nav');

  if (!navToggle || !mainNav) return;

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ============================================================================
 * 2. MÁSCARA INTELIGENTE PARA TELEFONE
 * ============================================================================ */
function initPhoneMasks() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  
  phoneInputs.forEach(input => {
    input.addEventListener('input', () => {
      let valor = input.value.replace(/\D/g, '');
      if (valor.length > 11) valor = valor.slice(0, 11);

      if (valor.length > 10) {
        input.value = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (valor.length > 6) {
        input.value = valor.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
      } else if (valor.length > 2) {
        input.value = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      } else if (valor.length > 0) {
        input.value = valor.replace(/^(\d{0,2})$/, '($1');
      } else {
        input.value = '';
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        const pos = input.selectionStart;
        const val = input.value;
        if (pos > 0 && ['-', ')', ' ', '('].includes(val[pos - 1])) {
          e.preventDefault();
          const apenasNumeros = val.replace(/\D/g, '');
          input.value = apenasNumeros.slice(0, -1);
          input.dispatchEvent(new Event('input'));
        }
      }
    });
  });
}

/* ============================================================================
 * 3. SISTEMA DE CADASTRO E MÚLTIPLOS PETS (PÁGINA DE CADASTRO)
 * ============================================================================ */
function initPetProfileSystem() {
  const form = document.getElementById('complete-profile-form');
  if (!form) return;

  const tutorNameInput = document.getElementById('tutor-name');
  const tutorPhoneInput = document.getElementById('tutor-phone');
  const petNameInput = document.getElementById('pet-name');
  const petTypeInput = document.getElementById('pet-type');
  const petAgeInput = document.getElementById('pet-age');
  const petGenderSelect = document.getElementById('pet-gender');
  const petSizeSelect = document.getElementById('pet-size');
  const petWeightInput = document.getElementById('pet-weight');
  
  const activePetIndexInput = document.getElementById('active-pet-index');
  const tabsNav = document.getElementById('pets-tabs-nav');
  const btnAddPet = document.getElementById('btn-add-pet');
  const btnDeletePet = document.getElementById('btn-delete-pet');
  const savedMsg = document.getElementById('profile-saved-msg');

  let profileData = JSON.parse(localStorage.getItem('focinho_profile')) || {
    tutor: { name: '', phone: '' },
    pets: [{ name: '', type: '', age: '', gender: 'Macho', size: 'Mini / Pequeno (Até 10kg)', weight: '' }]
  };

  let currentIndex = 0;

  function loadDataToInputs() {
    if (!profileData.tutor) profileData.tutor = { name: '', phone: '' };
    if (!profileData.pets || profileData.pets.length === 0) {
      profileData.pets = [{ name: '', type: '', age: '', gender: 'Macho', size: 'Mini / Pequeno (Até 10kg)', weight: '' }];
    }

    tutorNameInput.value = profileData.tutor.name || '';
    tutorPhoneInput.value = profileData.tutor.phone || '';
    loadActivePetToInputs();
    renderTabs();
  }

  function loadActivePetToInputs() {
    const pet = profileData.pets[currentIndex] || profileData.pets[0];
    petNameInput.value = pet.name || '';
    petTypeInput.value = pet.type || '';
    petAgeInput.value = pet.age || '';
    petGenderSelect.value = pet.gender || 'Macho';
    petSizeSelect.value = pet.size || 'Mini / Pequeno (Até 10kg)';
    petWeightInput.value = pet.weight || '';
    
    if (activePetIndexInput) activePetIndexInput.value = currentIndex;

    if (btnDeletePet) {
      if (profileData.pets.length > 1) {
        btnDeletePet.style.display = 'inline-block';
      } else {
        btnDeletePet.style.display = 'none';
      }
    }
  }

  function saveCurrentPetFromInputs() {
    profileData.tutor.name = tutorNameInput.value.trim();
    profileData.tutor.phone = tutorPhoneInput.value.trim();

    if (!profileData.pets[currentIndex]) profileData.pets[currentIndex] = {};

    profileData.pets[currentIndex] = {
      name: petNameInput.value.trim(),
      type: petTypeInput.value.trim(),
      age: petAgeInput.value.trim(),
      gender: petGenderSelect.value,
      size: petSizeSelect.value,
      weight: petWeightInput.value.trim()
    };
  }

  function renderTabs() {
    if (!tabsNav) return;
    tabsNav.innerHTML = '';

    profileData.pets.forEach((pet, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `btn btn-sm ${index === currentIndex ? 'btn-primary' : 'btn-secondary'}`;
      btn.style.cssText = 'padding: 6px 12px; font-size: 13px; cursor: pointer; border-radius: 6px;';
      btn.innerText = pet.name ? pet.name : `Pet ${index + 1}`;
      
      btn.addEventListener('click', () => {
        saveCurrentPetFromInputs();
        currentIndex = index;
        loadActivePetToInputs();
        renderTabs();
      });

      tabsNav.appendChild(btn);
    });
  }

  if (btnAddPet) {
    btnAddPet.addEventListener('click', () => {
      saveCurrentPetFromInputs();
      profileData.pets.push({
        name: '', type: '', age: '', gender: 'Macho', size: 'Mini / Pequeno (Até 10kg)', weight: ''
      });
      currentIndex = profileData.pets.length - 1;
      loadActivePetToInputs();
      renderTabs();
    });
  }

  if (btnDeletePet) {
    btnDeletePet.addEventListener('click', () => {
      if (profileData.pets.length <= 1) return;
      profileData.pets.splice(currentIndex, 1);
      currentIndex = Math.max(0, currentIndex - 1);
      loadActivePetToInputs();
      renderTabs();
      localStorage.setItem('focinho_profile', JSON.stringify(profileData));
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCurrentPetFromInputs();
    localStorage.setItem('focinho_profile', JSON.stringify(profileData));

    if (savedMsg) {
      savedMsg.style.display = 'block';
      setTimeout(() => {
        savedMsg.style.display = 'none';
      }, 3500);
    }
    renderTabs();
  });

  loadDataToInputs();
}

/* ============================================================================
 * 4. SISTEMA DE AGENDAMENTO, WHATSAPP E CARRINHO (PÁGINA DE SERVIÇOS)
 * ============================================================================ */
function initServiceModalSystem() {
  const modal = document.getElementById('service-modal');
  const closeModalBtn = document.getElementById('close-service-modal');
  const containerPetsServico = document.getElementById('select-pet-for-service');
  const noPetWarning = document.getElementById('no-pet-warning');
  const modalTitle = document.getElementById('modal-service-title');
  const modalPrice = document.getElementById('modal-service-price');
  const confirmBtn = document.getElementById('confirm-service-whatsapp');
  const addToCartBtn = document.getElementById('add-to-cart-service');

  if (!modal) return;

  let currentService = { name: '', basePrice: 0, finalPrice: '', rawNumericPrice: 0 };

  const multiplicadoresPorte = {
    'pequeno': 1.0,
    'medio': 1.3,
    'grande': 1.6
  };

  function calcularPrecoMultiplosPets() {
    if (!containerPetsServico) return;
    
    const profileData = JSON.parse(localStorage.getItem('focinho_profile')) || { pets: [] };
    const savedPets = profileData.pets || [];
    
    const checkboxesMarcados = containerPetsServico.querySelectorAll('input[type="checkbox"]:checked');
    let totalGeral = 0;

    checkboxesMarcados.forEach(chk => {
      const nomePet = chk.value;
      const petEncontrado = savedPets.find(p => p.name === nomePet);
      let precoPet = currentService.basePrice;

      if (petEncontrado && petEncontrado.size) {
        const tamanhoStr = petEncontrado.size.toLowerCase();
        let fator = multiplicadoresPorte['pequeno'];
        
        if (tamanhoStr.includes('médio') || tamanhoStr.includes('medio')) {
          fator = multiplicadoresPorte['medio'];
        } else if (tamanhoStr.includes('grande')) {
          fator = multiplicadoresPorte['grande'];
        }
        
        precoPet = currentService.basePrice * fator;
      }
      totalGeral += precoPet;
    });

    const precoFormatado = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    if (modalPrice) modalPrice.textContent = `Valor estimado: ${precoFormatado}`;
    currentService.finalPrice = precoFormatado;
    currentService.rawNumericPrice = totalGeral;
  }

  document.querySelectorAll('.btn-open-service-modal').forEach(button => {
    button.addEventListener('click', (e) => {
      const serviceRow = e.target.closest('.service-row');
      if (!serviceRow) return;

      const titleEl = serviceRow.querySelector('h3');
      const priceEl = serviceRow.querySelector('.product-price');

      currentService.name = titleEl ? titleEl.textContent.trim() : 'Serviço';
      
      if (priceEl) {
        let priceText = priceEl.textContent;
        let numbersOnly = priceText.replace(/[^\d,]/g, '').replace(',', '.');
        currentService.basePrice = parseFloat(numbersOnly) || 0;
      }

      if (modalTitle) modalTitle.textContent = `Agendar: ${currentService.name}`;

      const profileData = JSON.parse(localStorage.getItem('focinho_profile')) || { pets: [], tutor: {} };
      const savedPets = profileData.pets || [];
      
      if (containerPetsServico) {
        containerPetsServico.innerHTML = '';
        containerPetsServico.style.cssText = 'max-height: 160px; overflow-y: auto; margin-top: 10px; padding-right: 4px;';

        if (savedPets.length === 0 || savedPets.every(p => !p.name)) {
          containerPetsServico.style.display = 'none';
          if (noPetWarning) noPetWarning.style.display = 'block';
          if (confirmBtn) confirmBtn.style.display = 'none';
          if (addToCartBtn) addToCartBtn.style.display = 'none';
        } else {
          containerPetsServico.style.display = 'block';
          if (noPetWarning) noPetWarning.style.display = 'none';
          if (confirmBtn) confirmBtn.style.display = 'block';
          if (addToCartBtn) addToCartBtn.style.display = 'block';

          savedPets.forEach((pet) => {
            if (!pet.name) return;
            
            const label = document.createElement('label');
            label.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 10px 12px; margin-bottom: 6px; cursor: pointer; border: 1px solid #E2E8F0; border-radius: 8px; background: #F8FAFC; transition: all 0.2s ease; z-index: 1001; position: relative;';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = pet.name;
            checkbox.checked = true;
            checkbox.style.cssText = 'width: 18px; height: 18px; cursor: pointer; accent-color: var(--amber, #FF6B35);';
            checkbox.addEventListener('change', calcularPrecoMultiplosPets);

            const textoSpan = document.createElement('span');
            textoSpan.textContent = `${pet.name} (${pet.size || 'Porte não informado'})`;
            textoSpan.style.cssText = 'font-size: 15px; font-weight: 500; color: #1E293B;';

            label.appendChild(checkbox);
            label.appendChild(textoSpan);
            containerPetsServico.appendChild(label);
          });

          calcularPrecoMultiplosPets();
        }
      }

      modal.style.display = 'flex';
      modal.style.zIndex = '99999'; // Garante que o modal fique por cima de tudo
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Botão de Continuar no WhatsApp
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!containerPetsServico) return;
      const checkboxesMarcados = containerPetsServico.querySelectorAll('input[type="checkbox"]:checked');
      
      if (checkboxesMarcados.length === 0) {
        alert('Por favor, selecione pelo menos um pet para continuar.');
        return;
      }

      const profileData = JSON.parse(localStorage.getItem('focinho_profile')) || { pets: [], tutor: {} };
      const savedPets = profileData.pets || [];
      const tutor = profileData.tutor || {};

      let mensagem = `Olá! Gostaria de solicitar um agendamento.\n\n`;
      if (tutor.name) {
        mensagem += `👤 *Tutor(a):* ${tutor.name}\n`;
        if (tutor.phone) mensagem += `📞 *Telefone:* ${tutor.phone}\n`;
      }
      mensagem += `🐾 *Serviço:* ${currentService.name}\n`;
      mensagem += `💰 *Valor Estimado:* ${currentService.finalPrice}\n\n`;
      mensagem += `*Detalhes do(s) Pet(s) escolhido(s):*\n`;

      checkboxesMarcados.forEach((chk, index) => {
        const nomePet = chk.value;
        const petInfo = savedPets.find(p => p.name === nomePet);

        mensagem += `\n${index + 1}. *Nome:* ${nomePet}`;
        if (petInfo) {
          if (petInfo.type) mensagem += `\n   - Raça/Espécie: ${petInfo.type}`;
          if (petInfo.age) mensagem += `\n   - Idade: ${petInfo.age}`;
          if (petInfo.weight) mensagem += `\n   - Peso: ${petInfo.weight}kg`;
          if (petInfo.size) mensagem += `\n   - Porte: ${petInfo.size}`;
          if (petInfo.gender) mensagem += `\n   - Sexo: ${petInfo.gender}`;
        }
      });

      const numeroWhatsApp = '5583999999999'; // Substitua pelo seu número real
      const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
      
      window.open(urlWhatsApp, '_blank');
      modal.style.display = 'none';
    });
  }

  // Botão: Adicionar ao Carrinho e Redirecionar para Produtos
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!containerPetsServico) return;
      const checkboxesMarcados = containerPetsServico.querySelectorAll('input[type="checkbox"]:checked');
      
      if (checkboxesMarcados.length === 0) {
        alert('Por favor, selecione pelo menos um pet para adicionar ao carrinho.');
        return;
      }

      const profileData = JSON.parse(localStorage.getItem('focinho_profile')) || { pets: [] };
      const savedPets = profileData.pets || [];

      const petsSelecionados = [];
      checkboxesMarcados.forEach(chk => {
        const nomePet = chk.value;
        const petInfo = savedPets.find(p => p.name === nomePet);
        if (petInfo) {
          petsSelecionados.push(petInfo);
        } else {
          petsSelecionados.push({ name: nomePet });
        }
      });

      const itemCarrinho = {
        tipo: 'servico',
        nomeServico: currentService.name,
        preco: currentService.rawNumericPrice,
        precoFormatado: currentService.finalPrice,
        pets: petsSelecionados
      };

      let carrinho = JSON.parse(localStorage.getItem('focinho_cart')) || [];
      carrinho.push(itemCarrinho);
      localStorage.setItem('focinho_cart', JSON.stringify(carrinho));

      // Fecha o modal e redireciona para a aba/página de produtos (onde fica o carrinho)
      modal.style.display = 'none';
      window.location.href = 'produtos.html';
    });
  }
}