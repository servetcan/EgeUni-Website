// Karanlık Mod Fonksiyonu
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // LocalStorage'dan kaydedilmiş tercihi kontrol et
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Tercih varsa onu kullan, yoksa sistem tercihini kullan
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
    } else {
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
    }
    
    // Toggle butonu event listener
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            body.classList.toggle('light-mode');
            
            // Tercihi kaydet
            const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
        });
    }
}

// Logo beyaz arka planını kaldır
function removeWhiteBackgroundFromLogo() {
    const logoImg = document.querySelector('.logo img');
    if (!logoImg || logoImg.tagName !== 'IMG') return;
    
    // Görsel yüklenene kadar bekle
    if (!logoImg.complete || logoImg.naturalWidth === 0) {
        logoImg.addEventListener('load', processLogo, { once: true });
        return;
    }
    processLogo();
    
    function processLogo() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            // Local dosya için crossOrigin gerekmez
            if (logoImg.src.startsWith('http') && !logoImg.src.startsWith(window.location.origin)) {
                img.crossOrigin = 'anonymous';
            }
            
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Beyaz ve açık renkli pixelleri şeffafa çevir
                let hasWhitePixels = false;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];
                    
                    // Zaten şeffaf ise atla
                    if (a === 0) continue;
                    
                    // Beyaz veya çok açık renkleri tespit et (threshold: 230 - daha hassas)
                    // Hem tam beyaz hem de çok açık gri tonları yakala
                    // Karanlık mod için daha agresif temizleme
                    if ((r > 230 && g > 230 && b > 230) || 
                        (r > 245 && g > 245 && b > 245)) {
                        data[i + 3] = 0; // Alpha'yı 0 yap (şeffaf)
                        hasWhitePixels = true;
                    }
                }
                
                // Sadece beyaz pixeller varsa değiştir
                if (hasWhitePixels) {
                    ctx.putImageData(imageData, 0, 0);
                    logoImg.src = canvas.toDataURL('image/png');
                }
            };
            
            img.onerror = function() {
                console.log('Logo yükleme hatası');
            };
            
            img.src = logoImg.src;
        } catch (e) {
            console.log('Logo işleme hatası:', e);
        }
    }
}

// Mobil menü toggle fonksiyonu
document.addEventListener('DOMContentLoaded', function() {
    // Karanlık modu başlat
    initDarkMode();
    
    // Logo beyaz arka planını kaldır
    removeWhiteBackgroundFromLogo();
    
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Hamburger animasyonu
            const spans = menuToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Menü dışına tıklandığında menüyü kapat
        document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Smooth scroll için anchor linkleri
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Mobil menüyü kapat
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        const spans = menuToggle.querySelectorAll('span');
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
            }
        });
    });

    // Scroll animasyonu için Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animasyon için elemanları gözlemle
    const animateElements = document.querySelectorAll('.quick-access-item, .news-card, .stat-item, .value-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

