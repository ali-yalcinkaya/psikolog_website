/**
 * PSİKOLOG WEB SİTESİ - GLOBAL JAVASCRIPT
 * Mobil menü, SSS akordeon, form doğrulama ve analytics
 */

// DataLayer için placeholder (GTM ile kullanılacak)
window.dataLayer = window.dataLayer || [];

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initFAQ();
  initAppointmentForm();
  initContactForm();
  initActiveNavLink();
  triggerPageViewEvents();
  initInstagramPlaceholder();
  initDateRestrictions();
  initScrollReveal();
  initTestimonialSlider();
  initSpeedDial();
});

/**
 * MOBİL MENÜ
 * Hamburger menü toggle fonksiyonu
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', function() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');

    // Body scroll'u engelle/aç
    if (!isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Menü linklerine tıklandığında menüyü kapat
  const menuLinks = navMenu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ESC tuşu ile menüyü kapat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/**
 * SSS AKORDEON
 * Tek seferde bir soru açık kalacak şekilde
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  if (faqItems.length === 0) return;

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    // İlk öğeyi varsayılan olarak aç
    if (index === 0) {
      item.classList.add('active');
      question.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }

    question.addEventListener('click', function() {
      const isActive = item.classList.contains('active');

      // Tüm öğeleri kapat
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherQuestion = otherItem.querySelector('.faq-question');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.style.maxHeight = '0';
      });

      // Eğer tıklanan kapalıysa aç
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/**
 * AKTİF NAVİGASYON LİNKİ
 * Mevcut sayfaya göre aktif linki işaretle
 */
function initActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu a');

  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage ||
        (currentPage === '' && linkPage === 'index.html') ||
        (currentPage === '/' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * RANDEVU FORMU DOĞRULAMA
 * İstemci taraflı form validasyonu ve gönderim
 */
function initAppointmentForm() {
  const form = document.getElementById('appointment-form');

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Formu temizle
    clearFormErrors(form);

    // Tüm alanları doğrula
    let isValid = true;
    const formData = {};

    // Ad Soyad
    const name = form.querySelector('#name');
    if (!name.value.trim()) {
      showError(name, 'Ad Soyad alanı zorunludur.');
      isValid = false;
    } else if (name.value.trim().length < 3) {
      showError(name, 'Ad Soyad en az 3 karakter olmalıdır.');
      isValid = false;
    } else {
      formData.name = name.value.trim();
    }

    // E-posta
    const email = form.querySelector('#email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showError(email, 'E-posta adresi zorunludur.');
      isValid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      showError(email, 'Geçerli bir e-posta adresi giriniz.');
      isValid = false;
    } else {
      formData.email = email.value.trim();
    }

    // Telefon (Türkiye formatı: 05XX XXX XX XX veya +905XX...)
    const phone = form.querySelector('#phone');
    const cleanPhone = phone.value.replace(/[\s\-\(\)\+]/g, '');
    const phonePatternLocal = /^0[5][0-9]{9}$/;
    const phonePatternIntl = /^90[5][0-9]{9}$/;
    if (!cleanPhone) {
      showError(phone, 'Telefon numarası zorunludur.');
      isValid = false;
    } else if (!phonePatternLocal.test(cleanPhone) && !phonePatternIntl.test(cleanPhone)) {
      showError(phone, 'Geçerli bir telefon numarası giriniz (ör: 05XX XXX XX XX).');
      isValid = false;
    } else {
      formData.phone = cleanPhone;
    }

    // Tercih edilen tarih
    const date = form.querySelector('#preferred-date');
    if (date && date.value) {
      formData.preferredDate = date.value;
    }

    // Tercih edilen saat
    const time = form.querySelector('#preferred-time');
    if (time && time.value) {
      formData.preferredTime = time.value;
    }

    // Danışma konusu
    const topic = form.querySelector('#topic');
    if (topic && topic.value) {
      formData.topic = topic.value;
    }

    // Mesaj
    const message = form.querySelector('#message');
    if (message && message.value.trim()) {
      formData.message = message.value.trim();
    }

    // KVKK onayı
    const consent = form.querySelector('#consent');
    if (!consent.checked) {
      showError(consent.parentElement, 'KVKK aydınlatma metnini okuyup onaylamanız gerekmektedir.');
      isValid = false;
    } else {
      formData.consent = true;
    }

    // Form geçerli değilse dur
    if (!isValid) {
      return;
    }

    // Form geçerli - Netlify Forms ile gönder
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gönderiliyor...';

    // Netlify Forms için form verisini hazırla
    const netlifyData = new FormData(form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(netlifyData).toString()
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Form gönderilemedi');

      // Google Ads dönüşüm eventi
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'lead_submit',
          form_type: 'appointment',
          form_data: formData
        });
      }

      // Başarı mesajını göster
      showSuccessMessage(form);
      form.reset();
    })
    .catch(function(error) {
      console.error('Form gönderim hatası:', error);
      alert('Form gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin veya WhatsApp üzerinden iletişime geçin.');
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Randevu Talebini Gönder';
    });
  });
}

/**
 * İLETİŞİM FORMU DOĞRULAMA
 * Basit iletişim formu için
 */
function initContactForm() {
  const form = document.getElementById('contact-form');

  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    clearFormErrors(form);

    let isValid = true;
    const formData = {};

    // Ad Soyad
    const name = form.querySelector('#contact-name');
    if (name) {
      if (!name.value.trim()) {
        showError(name, 'Ad Soyad alanı zorunludur.');
        isValid = false;
      } else {
        formData.name = name.value.trim();
      }
    }

    // E-posta
    const email = form.querySelector('#contact-email');
    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        showError(email, 'E-posta adresi zorunludur.');
        isValid = false;
      } else if (!emailPattern.test(email.value.trim())) {
        showError(email, 'Geçerli bir e-posta adresi giriniz.');
        isValid = false;
      } else {
        formData.email = email.value.trim();
      }
    }

    // Mesaj
    const message = form.querySelector('#contact-message');
    if (message) {
      if (!message.value.trim()) {
        showError(message, 'Mesaj alanı zorunludur.');
        isValid = false;
      } else if (message.value.trim().length < 10) {
        showError(message, 'Mesaj en az 10 karakter olmalıdır.');
        isValid = false;
      } else {
        formData.message = message.value.trim();
      }
    }

    if (!isValid) return;

    console.log('İletişim Form Verileri:', formData);

    // Analytics event
    window.dataLayer.push({
      event: 'contact_submit',
      form_type: 'contact'
    });

    showSuccessMessage(form);
    form.reset();
  });
}

/**
 * FORM HATA GÖSTERME
 */
function showError(field, message) {
  field.setAttribute('aria-invalid', 'true');

  // Hata mesajı elementi oluştur veya güncelle
  let errorElement = field.parentElement.querySelector('.form-error');

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    field.parentElement.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.classList.add('visible');

  // İlk hataya odaklan
  if (!document.querySelector('[aria-invalid="true"]:focus')) {
    field.focus();
  }
}

/**
 * FORM HATALARINI TEMİZLE
 */
function clearFormErrors(form) {
  const errorElements = form.querySelectorAll('.form-error');
  errorElements.forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });

  const invalidFields = form.querySelectorAll('[aria-invalid="true"]');
  invalidFields.forEach(field => {
    field.setAttribute('aria-invalid', 'false');
  });
}

/**
 * BAŞARI MESAJI GÖSTER
 */
function showSuccessMessage(form) {
  // Mevcut başarı mesajını kaldır
  const existingSuccess = form.querySelector('.form-success');
  if (existingSuccess) {
    existingSuccess.remove();
  }

  // Yeni başarı mesajı oluştur
  const successDiv = document.createElement('div');
  successDiv.className = 'form-success';
  successDiv.setAttribute('role', 'alert');
  successDiv.innerHTML = `
    <span class="form-success-icon">✓</span>
    <strong>Mesajınız başarıyla gönderildi!</strong>
    <p>En kısa sürede size dönüş yapacağız. Teşekkür ederiz.</p>
  `;

  form.insertBefore(successDiv, form.firstChild);

  // Başarı mesajına scroll
  successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // 10 saniye sonra mesajı kaldır
  setTimeout(() => {
    successDiv.style.transition = 'opacity 0.5s';
    successDiv.style.opacity = '0';
    setTimeout(() => successDiv.remove(), 500);
  }, 10000);
}

/**
 * SAYFA GÖRÜNTÜLEME EVENTLERİ
 * Randevu sayfası için lead_view eventi
 */
function triggerPageViewEvents() {
  const currentPage = window.location.pathname;

  // Randevu sayfası görüntüleme eventi
  if (currentPage.includes('randevu.html')) {
    window.dataLayer.push({
      event: 'lead_view',
      page: 'appointment'
    });
  }
}

/**
 * INSTAGRAM PLACEHOLDER FEED
 * Gerçek Instagram embed kullanılmıyorsa bu fonksiyon çalışır
 */
function initInstagramPlaceholder() {
  const instagramContainer = document.querySelector('.instagram-posts');

  if (!instagramContainer) return;

  // Eğer container boşsa placeholder kartlar oluştur
  if (instagramContainer.children.length === 0) {
    const placeholderPosts = [
      {
        image: 'assets/img/insta1.webp',
        text: 'Stres yönetimi ile ilgili ipuçları ve teknikleri paylaşıyorum. Günlük yaşamda uygulayabileceğiniz basit ama etkili yöntemler.',
        link: 'https://www.instagram.com/p/PLACEHOLDER1/'
      },
      {
        image: 'assets/img/insta2.webp',
        text: 'Sağlıklı iletişim becerileri hakkında. İlişkilerinizi güçlendirmek için dikkat etmeniz gerekenler.',
        link: 'https://www.instagram.com/p/PLACEHOLDER2/'
      },
      {
        image: 'assets/img/insta3.webp',
        text: 'Farkındalık ve mindfulness pratiği. Şimdiki ana odaklanmanın faydaları ve nasıl yapılacağı.',
        link: 'https://www.instagram.com/p/PLACEHOLDER3/'
      },
      {
        image: 'assets/img/insta4.webp',
        text: 'Anksiyete ile başa çıkma yöntemleri. Endişelerinizi yönetmenize yardımcı olacak pratik öneriler.',
        link: 'https://www.instagram.com/p/PLACEHOLDER4/'
      }
    ];

    placeholderPosts.forEach(post => {
      const card = createInstagramCard(post);
      instagramContainer.appendChild(card);
    });
  }
}

/**
 * INSTAGRAM KART OLUŞTUR
 */
function createInstagramCard(post) {
  const card = document.createElement('div');
  card.className = 'instagram-card';

  card.innerHTML = `
    <img src="${post.image}" alt="Instagram gönderisi" class="instagram-image" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22280%22%3E%3Crect fill=%22%23fce2ba%22 width=%22280%22 height=%22280%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%232b2b2b%22%3EInstagram G%C3%B6rsel%3C/text%3E%3C/svg%3E'">
    <div class="instagram-content">
      <p class="instagram-text">${post.text}</p>
      <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="instagram-link">
        Instagram'da Gör →
      </a>
    </div>
  `;

  return card;
}

/**
 * RANDEVU TARİH KISITLAMALARI
 * Pazar günlerini devre dışı bırak, çalışma saatleri: Pazartesi-Cumartesi 09:00-21:00
 */
function initDateRestrictions() {
  const dateInput = document.getElementById('preferred-date');
  if (!dateInput) return;

  // Minimum tarih: bugün
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);

  // Pazar günü seçildiğinde uyarı ver
  dateInput.addEventListener('change', function() {
    if (this.value) {
      const selectedDate = new Date(this.value + 'T00:00:00');
      if (selectedDate.getDay() === 0) {
        // Pazar günü seçildi
        let errorEl = this.parentElement.querySelector('.form-error');
        if (!errorEl) {
          errorEl = document.createElement('div');
          errorEl.className = 'form-error';
          this.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = 'Pazar günleri kapalıyız. Lütfen başka bir gün seçiniz.';
        errorEl.classList.add('visible');
        this.value = '';
      } else {
        const errorEl = this.parentElement.querySelector('.form-error');
        if (errorEl) {
          errorEl.classList.remove('visible');
          errorEl.textContent = '';
        }
      }
    }
  });
}

/**
 * SMOOTH SCROLL
 * Sayfa içi linklere yumuşak geçiş (opsiyonel)
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');

    if (href === '#') return;

    const target = document.querySelector(href);

    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/**
 * HEADER SCROLL EFEKTİ (Opsiyonel)
 * Scroll edildiğinde header'a gölge ekle
 */
let lastScroll = 0;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', function() {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 50) {
    header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
  }

  lastScroll = currentScroll;
});

/**
 * BLOG FONKSİYONLARI
 * Blog sayfası için arama ve filtreleme
 */

// Blog verilerini sakla
let allBlogPosts = [];

/**
 * BLOG BAŞLAT
 */
function initBlog() {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;

  // Tüm blog kartlarını al ve sakla
  allBlogPosts = Array.from(blogGrid.querySelectorAll('.blog-card'));

  // Arama
  const searchInput = document.getElementById('blog-search');
  if (searchInput) {
    searchInput.addEventListener('input', handleBlogSearch);
  }

  // Kategori filtreleri
  const filterButtons = document.querySelectorAll('.blog-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', handleBlogFilter);
  });
}

/**
 * BLOG ARAMA
 */
function handleBlogSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  const activeCategory = document.querySelector('.blog-filter-btn.active')?.dataset.category || 'all';

  filterBlogPosts(searchTerm, activeCategory);
}

/**
 * BLOG FİLTRELEME
 */
function handleBlogFilter(e) {
  const button = e.currentTarget;
  const category = button.dataset.category;

  // Aktif butonu güncelle
  document.querySelectorAll('.blog-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');

  // Arama terimini al
  const searchInput = document.getElementById('blog-search');
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

  filterBlogPosts(searchTerm, category);
}

/**
 * BLOG GÖNDERİLERİNİ FİLTRELE
 */
function filterBlogPosts(searchTerm, category) {
  const blogGrid = document.querySelector('.blog-grid');
  let visibleCount = 0;

  allBlogPosts.forEach(post => {
    const title = post.querySelector('.blog-card-title')?.textContent.toLowerCase() || '';
    const excerpt = post.querySelector('.blog-excerpt')?.textContent.toLowerCase() || '';
    const postCategory = post.dataset.category || '';

    // Kategori kontrolü
    const categoryMatch = category === 'all' || postCategory === category;

    // Arama kontrolü
    const searchMatch = !searchTerm || title.includes(searchTerm) || excerpt.includes(searchTerm);

    // Her iki koşul da sağlanırsa göster
    if (categoryMatch && searchMatch) {
      post.style.display = '';
      visibleCount++;
    } else {
      post.style.display = 'none';
    }
  });

  // Sonuç yoksa mesaj göster
  updateBlogEmptyState(visibleCount);
}

/**
 * BOŞ DURUM MESAJI
 */
function updateBlogEmptyState(visibleCount) {
  const blogGrid = document.querySelector('.blog-grid');
  let emptyState = document.querySelector('.blog-empty');

  if (visibleCount === 0) {
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'blog-empty';
      emptyState.innerHTML = `
        <div class="blog-empty-icon">🔍</div>
        <h3>Sonuç Bulunamadı</h3>
        <p>Aradığınız kriterlere uygun blog yazısı bulunamadı. Lütfen farklı bir arama terimi veya kategori deneyin.</p>
      `;
      blogGrid.parentElement.appendChild(emptyState);
    }
    emptyState.style.display = 'block';
  } else {
    if (emptyState) {
      emptyState.style.display = 'none';
    }
  }
}

/**
 * BLOG PAYLAŞIM BUTONLARI
 */
function initBlogShare() {
  const shareButtons = document.querySelectorAll('.share-btn');

  shareButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();

      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      const platform = this.classList.contains('twitter') ? 'twitter' :
                      this.classList.contains('facebook') ? 'facebook' :
                      this.classList.contains('linkedin') ? 'linkedin' :
                      this.classList.contains('whatsapp') ? 'whatsapp' : '';

      let shareUrl = '';

      switch(platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${title}%20${url}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    });
  });
}

// Sayfa yüklendiğinde blog fonksiyonlarını başlat
document.addEventListener('DOMContentLoaded', function() {
  initBlog();
  initBlogShare();
});

/**
 * DANIŞAN YORUMLARI - SLIDER/CAROUSEL
 * Sürükle & kaydır, buton navigasyonu, dot göstergesi
 */
function initTestimonialSlider() {
  const slider = document.getElementById('testimonialSlider');
  if (!slider) return;

  const track = slider.querySelector('.testimonial-slider-track');
  const slides = slider.querySelectorAll('.testimonial-slide');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');
  const dotsContainer = document.getElementById('sliderDots');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  // Dot'ları oluştur
  slides.forEach(function(_, i) {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Yorum ' + (i + 1));
    dot.addEventListener('click', function() { goToSlide(i); });
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentIndex = index;
    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

    // Dot'ları güncelle
    var dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  prevBtn.addEventListener('click', function() { goToSlide(currentIndex - 1); });
  nextBtn.addEventListener('click', function() { goToSlide(currentIndex + 1); });

  // Touch/swipe desteği
  let startX = 0;
  let isDragging = false;

  track.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  track.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
  }, { passive: true });

  // Otomatik geçiş (6 saniyede bir)
  var autoplay = setInterval(function() { goToSlide(currentIndex + 1); }, 6000);

  // Slider üzerine gelindiğinde otomatik geçişi durdur
  slider.addEventListener('mouseenter', function() { clearInterval(autoplay); });
  slider.addEventListener('mouseleave', function() {
    autoplay = setInterval(function() { goToSlide(currentIndex + 1); }, 6000);
  });
}

/**
 * SCROLL REVEAL ANİMASYONLARI
 * Intersection Observer ile performanslı fade-in-up efekti
 */
function initScrollReveal() {
  var revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  // Reduced motion tercihini kontrol et
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach(function(el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(function(el) { observer.observe(el); });
}

/**
 * SPEED DIAL (Sabit İletişim Butonu)
 * Tek buton tıklandığında WhatsApp, Telefon, Mail açılır
 */
function initSpeedDial() {
  var dial = document.getElementById('speedDial');
  var trigger = document.getElementById('speedDialTrigger');

  if (!dial || !trigger) return;

  // Overlay oluştur
  var overlay = document.createElement('div');
  overlay.className = 'speed-dial-overlay';
  document.body.appendChild(overlay);

  function toggleDial() {
    var isOpen = dial.classList.contains('open');
    dial.classList.toggle('open');
    overlay.classList.toggle('active');
    trigger.setAttribute('aria-expanded', !isOpen);
  }

  function closeDial() {
    dial.classList.remove('open');
    overlay.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleDial();
  });

  overlay.addEventListener('click', closeDial);

  // ESC ile kapat
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && dial.classList.contains('open')) {
      closeDial();
    }
  });
}

// Console'da bilgi
console.log('%c🌟 Psikolog Web Sitesi', 'font-size: 16px; font-weight: bold; color: #d4a574;');
console.log('%cErişilebilir, hızlı ve modern bir web deneyimi.', 'color: #5a5a5a;');

/**
 * BLOG GÖNDERİ YÜKLEYİCİ
 * _posts/index.json'dan yazıları okur, kartları oluşturur ve DOM'a ekler.
 * blog.html ve index.html tarafından kullanılır.
 */

var BLOG_FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23fce2ba%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2218%22 fill=%22%232b2b2b%22%3EBlog G%C3%B6rseli%3C%2Ftext%3E%3C%2Fsvg%3E";

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    var d = new Date(dateStr + 'T00:00:00');
    var months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) { return dateStr; }
}

function buildBlogCard(post) {
  var article = document.createElement('article');
  article.className = 'blog-card';
  if (post.category) {
    article.dataset.category = post.category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[ıİ]/g, 'i')
      .replace(/[şŞ]/g, 's')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[üÜ]/g, 'u')
      .replace(/[öÖ]/g, 'o')
      .replace(/[çÇ]/g, 'c');
  }
  var slug = post.file.replace(/\.md$/, '');
  var href = 'blog-detay.html?post=' + encodeURIComponent(slug);
  var thumb = post.thumbnail || BLOG_FALLBACK_IMG;
  var date = formatDate(post.date);
  var readStr = post.readingTime ? post.readingTime + ' dk okuma' : '';

  var img = document.createElement('img');
  img.src = thumb;
  img.alt = post.title || '';
  img.className = 'blog-card-image';
  img.loading = 'lazy';
  img.onerror = function () { this.onerror = null; this.src = BLOG_FALLBACK_IMG; };

  var inner = '<div class="blog-card-content">' +
    '<span class="blog-category">' + (post.category || '') + '</span>' +
    '<h3 class="blog-card-title"><a href="' + href + '">' + (post.title || '') + '</a></h3>' +
    '<div class="blog-meta">' +
    '<span class="blog-meta-item"><span aria-hidden="true">📅</span> ' + date + '</span>' +
    (readStr ? '<span class="blog-meta-item"><span aria-hidden="true">⏱</span> ' + readStr + '</span>' : '') +
    '</div>' +
    '<p class="blog-excerpt">' + (post.excerpt || '') + '</p>' +
    '<a href="' + href + '" class="blog-read-more">Devamını Oku <span aria-hidden="true">→</span></a>' +
    '</div>';

  article.appendChild(img);
  article.insertAdjacentHTML('beforeend', inner);
  return article;
}

async function loadBlogPosts(container, limit) {
  if (!container) return;
  try {
    var res = await fetch('/_posts/index.json');
    if (!res.ok) return;
    var posts = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) return;
    if (limit) posts = posts.slice(0, limit);
    container.innerHTML = '';
    posts.forEach(function (post) {
      container.appendChild(buildBlogCard(post));
    });
    // blog.html'deki filtre/arama için allBlogPosts'u güncelle
    if (typeof allBlogPosts !== 'undefined' && container.classList.contains('blog-grid')) {
      allBlogPosts = Array.from(container.querySelectorAll('.blog-card'));
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', function () {
  // blog.html: tüm yazıları yükle
  var blogGrid = document.querySelector('.blog-grid');
  if (blogGrid) loadBlogPosts(blogGrid, null);

  // index.html: son 3 yazıyı yükle
  var homeBlogGrid = document.getElementById('home-blog-grid');
  if (homeBlogGrid) loadBlogPosts(homeBlogGrid, 3);
});
