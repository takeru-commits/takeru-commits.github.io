// Firebase SDK Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc, where } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js"; // 'where' をインポート
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
    
const firebaseConfig = {
    apiKey: "AIzaSyBVH-Wr8v--A0uSn8Z82fFLdn_v6SZoT8Y", // ★★★ あなたの実際のFirebase APIキーに置き換えてください！ ★★★
    authDomain: "yamaguchi-halal-eats.firebaseapp.com",
    projectId: "yamaguchi-halal-eats",
    storageBucket: "yamaguchi-halal-eats.appspot.com",
    messagingSenderId: "471358397224",
    appId: "1:471358397224:web:46184a676f2b9b23860e1d",
    measurementId: "G-XKK7QMMWWN"
};

let db, auth;
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "rgKDs7T8tsdoDQigLLX2CkGprx62") {
    try { const app = initializeApp(firebaseConfig); db = getFirestore(app); auth = getAuth(app); }
    catch (e) { console.error("Error initializing Firebase:", e); }
}
    
// --- Translations & Data ---
const translations = {
    en: { 
        homeLink: "Home", menuLink: "Our Menu", howToOrderLink: "How to Order", aboutUsLink: "About Us", contactLink: "Contact", calendarLink: "Calendar", loginBtn: "Log In", signupBtn: "Sign Up", myAccountBtn: '<i class="fas fa-user-circle mr-1"></i>My Account', logoutBtn: '<i class="fas fa-sign-out-alt mr-1"></i>Log Out', 
        heroTitle: "Authentic Halal Cuisine, Delivered to Your Door.", heroSubtitle: "We deliver our original Halal dishes with care, anywhere in Yamaguchi Prefecture.", searchPlaceholder: "Search for our dishes...", 
        calendarTitle: "Pre-Order Calendar ({month})", calendarDesc: "Click a date on the calendar to select a pre-order day.<br>Only residents of the listed city can pre-order on that day.", 
        menuTitle: "Our Signature Menu", 
        // メニューカテゴリボタンの翻訳を追加
        japaneseMenuBtn: "Japanese Cuisine", 
        indonesianMenuBtn: "Indonesian Cuisine", 
        sweetsMenuBtn: "Sweets", 
        drinksMenuBtn: "Drinks",
        addBtn: "Add", addedBtn: "Added", 
        howToOrderTitle: "How to Order", step1Title: "1. Choose", step1Desc: "Select your favorite dishes from our menu.", step2Title: "2. Checkout", step2Desc: "Enter your details and confirm your order.", step3Title: "3. Enjoy", step3Desc: "Your delicious meal will be delivered to you.", 
        aboutTitle: "About Us", historyTitle: "Our History", historyDesc: "This service was started by a Japanese and an Indonesian living together in Yamaguchi Prefecture. Our mission is to deliver authentic, delicious, and worry-free Halal meals to everyone who needs them in our community. We pour our hearts into every dish, hoping to bring you the comforting taste of home.", 
        contactTitle: "Contact Us", messageLabel: "Message", sendMessageBtn: "Send Message", messageSuccess: "Thank you! Your message has been sent.", 
        footerRights: "&copy; 2025 Yamaguchi Halal Eats. All Rights Reserved.", adminPanelBtn: "Admin Panel", 
        cartTitle: "Shopping Cart", cartEmpty: "Your cart is empty.", cartTotal: "Total:", checkoutBtn: "Checkout", 
        checkoutModalTitle: "Confirm Your Order", yourInfoTitle: "Your Information", nameLabel: "Full Name", phoneLabel: "Phone Number", emailLabel: "Email Address", addressLabel: "Delivery Address", addressNote: "Please enter your home address only. Delivery to public institutions is not available.", formError: "Please fill in all fields.", totalPaymentLabel: "Total Payment:", confirmOrderBtn: "Confirm Order", 
        thankYouTitle: "Thank You for Your Order!", thankYouDesc: "Your order has been successfully placed.", closeBtn: "Close", 
        createAccountTitle: "Create Your Account", passwordLabel: "Password", loginTitle: "Log In to Your Account", myAccountTitle: "My Account", profileUpdateSuccess: "Profile updated successfully!", saveChangesBtn: "Save Changes", welcome: "Welcome", preorderYamaguchi: "Delivery for {date} is available for residents of Yamaguchi City. Please proceed with your order.", preorderUbe: "Delivery for {date} is available for residents of Ube City. Please proceed with your order.", dbError: "Database connection error. Order cannot be saved because Firebase is not configured.", orderError: "An error occurred while processing your order. Please try again.", passwordIncorrect: "Incorrect password.", signupBenefit: "Sign up to skip entering your delivery info every time & get a ¥100 coupon!", subtotalLabel: "Subtotal", discountLabel: "Coupon Discount", applyCouponBtn: "Apply ¥100 Coupon", couponApplied: "✓ Coupon Applied", myCoupons: "My Coupons", myOrders: "My Orders", welcomeCoupon: "¥100 OFF Welcome Coupon", noCoupons: "You have no available coupons.", whatIsHalalTitle: "What is Halal Food?", whatIsHalalDesc: "Halal is an Arabic word that means 'permissible' according to Islamic law. For food to be certified as Halal, it must adhere to a strict set of rules regarding ingredients and preparation methods. This ensures that the food is clean, pure, and prepared in a humane way." 
    },
    ja: { 
        homeLink: "ホーム", menuLink: "メニュー", howToOrderLink: "注文方法", aboutUsLink: "私たちについて", contactLink: "お問い合わせ", calendarLink: "カレンダー", loginBtn: "ログイン", signupBtn: "新規登録", myAccountBtn: '<i class="fas fa-user-circle mr-1"></i>アカウント', logoutBtn: '<i class="fas fa-sign-out-alt mr-1"></i>ログアウト', 
        heroTitle: "本格ハラール料理を、ご自宅で。", heroSubtitle: "山口県内、どこへでも真心を込めてお届けします。", searchPlaceholder: "料理を検索...", 
        calendarTitle: "事前注文カレンダー ({month})", calendarDesc: "カレンダーの日付をクリックして、事前注文日を選択してください。<br>記載された市にお住まいの方のみ、その日に事前注文が可能です。", 
        menuTitle: "私たちの特製メニュー", 
        // メニューカテゴリボタンの翻訳を追加
        japaneseMenuBtn: "日本料理", 
        indonesianMenuBtn: "インドネシア料理", 
        sweetsMenuBtn: "スイーツ", 
        drinksMenuBtn: "ドリンク",
        addBtn: "追加", addedBtn: "追加済み", 
        howToOrderTitle: "ご注文方法", step1Title: "1. 選ぶ", step1Desc: "メニューからお好きな料理をお選びください。", step2Title: "2. 注文", step2Desc: "お客様情報を入力し、注文を確定します。", step3Title: "3. 楽しむ", step3Desc: "美味しいお料理がご自宅に届きます。", 
        aboutTitle: "私たちについて", historyTitle: "私たちの歩み", historyDesc: "このサービスは、山口県に住む日本人とインドネシア人の二人が始めました。私たちの使命は、本格的で美味しく、そして安心できるハラール料理を、地域の皆様にお届けすることです。一皿一皿に心を込めて、故郷の味をお届けします。", 
        contactTitle: "お問い合わせ", messageLabel: "メッセージ", sendMessageBtn: "メッセージを送信", messageSuccess: "ありがとうございます。メッセージが送信されました。", 
        footerRights: "&copy; 2025 やまぐちHalal Eats. All Rights Reserved.", adminPanelBtn: "管理者パネル", 
        cartTitle: "ショッピングカート", cartEmpty: "カートは空です。", cartTotal: "合計:", checkoutBtn: "レジに進む", 
        checkoutModalTitle: "ご注文の確認", yourInfoTitle: "お客様情報", nameLabel: "お名前", phoneLabel: "電話番号", emailLabel: "メールアドレス", addressLabel: "配達先住所", addressNote: "ご自宅の住所のみご記入ください。公共機関への配達はできません。", formError: "すべての項目を入力してください。", totalPaymentLabel: "お支払い合計:", confirmOrderBtn: "注文を確定する", 
        thankYouTitle: "ご注文ありがとうございます！", thankYouDesc: "ご注文が正常に完了しました。", closeBtn: "閉じる", 
        createAccountTitle: "アカウント作成", passwordLabel: "パスワード", loginTitle: "アカウントにログイン", myAccountTitle: "マイアカウント", profileUpdateSuccess: "プロフィールを更新しました！", saveChangesBtn: "変更を保存", welcome: "ようこそ", preorderYamaguchi: "【{date}】は【山口市】にお住まいの方の配達日です。このままご注文ください。", preorderUbe: "【{date}】は【宇部市】にお住まいの方の配達日です。このままご注文ください。", dbError: "データベース接続エラー。Firebaseが設定されていないため、注文を保存できません。", orderError: "注文処理中にエラーが発生しました。もう一度お試しください。", passwordIncorrect: "パスワードが違います。", signupBenefit: "会員登録をすると、毎回の配達先入力が不要になり、100円クーポンもご利用いただけます！", subtotalLabel: "小計", discountLabel: "クーポン割引", applyCouponBtn: "100円クーポンを使う", couponApplied: "✓ クーポン適用済み", myCoupons: "マイクーポン", myOrders: "注文履歴", welcomeCoupon: "100円OFF ウェルカムクーポン", noCoupons: "利用可能なクーポンはありません。", whatIsHalalTitle: "ハラールフードとは？", whatIsHalalDesc: "ハラールとは、アラビア語で「（イスラムの教えにおいて）許されている」という意味の言葉です。ハラールフードとして認証されるためには、食材や調理法に関して厳格な基準を守る必要があります。これにより、食品が清潔で純粋であり、人道的な方法で調理されていることが保証されます。" 
    },
    id: { 
        homeLink: "Beranda", menuLink: "Menu Kami", howToOrderLink: "Cara Pesan", aboutUsLink: "Tentang Kami", contactLink: "Kontak", calendarLink: "Kalender", loginBtn: "Masuk", signupBtn: "Daftar", myAccountBtn: '<i class="fas fa-user-circle mr-1"></i>Akun Saya', logoutBtn: '<i class="fas fa-sign-out-alt mr-1"></i>Keluar', 
        heroTitle: "Masakan Halal Otentik, Diantar ke Pintu Anda.", heroSubtitle: "Kami mengantarkan hidangan Halal asli kami dengan hati-hati, ke mana saja di Prefektur Yamaguchi.", searchPlaceholder: "Cari hidangan kami...", 
        calendarTitle: "Kalender Pra-Pesan ({month})", calendarDesc: "Klik tanggal di kalender untuk memilih hari pra-pesan.<br>Hanya penduduk kota yang terdaftar yang dapat melakukan pra-pesan pada hari itu.", 
        menuTitle: "Menu Andalan Kami", 
        // メニューカテゴリボタンの翻訳を追加
        japaneseMenuBtn: "Masakan Jepang", 
        indonesianMenuBtn: "Masakan Indonesia", 
        sweetsMenuBtn: "Manisan", 
        drinksMenuBtn: "Minuman",
        addBtn: "Tambah", addedBtn: "Ditambahkan", 
        howToOrderTitle: "Cara Memesan", step1Title: "1. Pilih", step1Desc: "Pilih hidangan favorit Anda dari menu kami.", step2Title: "2. Bayar", step2Desc: "Masukkan data Anda dan konfirmasi pesanan Anda.", step3Title: "3. Nikmati", step3Desc: "Makanan lezat Anda akan diantarkan ke rumah Anda.", 
        aboutTitle: "Tentang Kami", historyTitle: "Sejarah Kami", historyDesc: "Layanan ini dimulai oleh seorang Jepang dan seorang Indonesia yang tinggal bersama di Prefektur Yamaguchi. Misi kami adalah untuk mengantarkan makanan Halal yang otentik, lezat, dan tanpa rasa khawatir kepada semua orang yang membututuhkan di komunitas kami. Kami mencurahkan hati kami ke dalam setiap hidangan, dengan harapan dapat memberikan Anda rasa nyaman seperti di rumah sendiri.", 
        contactTitle: "Hubungi Kami", messageLabel: "Pesan", sendMessageBtn: "Kirim Pesan", messageSuccess: "Terima Kasih! Pesan Anda telah terkirim.", 
        footerRights: "&copy; 2025 Yamaguchi Halal Eats. Semua Hak Dilindungi.", adminPanelBtn: "Panel Admin", 
        cartTitle: "Keranjang Belanja", cartEmpty: "Keranjang Anda kosong.", cartTotal: "Total:", checkoutBtn: "Bayar", 
        checkoutModalTitle: "Konfirmasi Pesanan Anda", yourInfoTitle: "Informasi Anda", nameLabel: "Nama Lengkap", phoneLabel: "Nomor Telepon", emailLabel: "Alamat Email", addressLabel: "Alamat Pengiriman", addressNote: "Harap masukkan alamat rumah Anda saja. Pengiriman ke institusi publik tidak tersedia.", formError: "Harap isi semua kolom.", totalPaymentLabel: "Total Pembayaran:", confirmOrderBtn: "Konfirmasi Pesanan", 
        thankYouTitle: "Terima Kasih Atas Pesanan Anda!", thankYouDesc: "Pesanan Anda telah berhasil dilakukan.", closeBtn: "Tutup", 
        createAccountTitle: "Buat Akun Anda", passwordLabel: "Kata Sandi", loginTitle: "Masuk ke Akun Anda", myAccountTitle: "Akun Saya", profileUpdateSuccess: "Profil berhasil diperbarui!", saveChangesBtn: "Simpan Perubahan", welcome: "Selamat Datang", preorderYamaguchi: "Pengiriman untuk {date} tersedia untuk penduduk Kota Yamaguchi. Silakan lanjutkan pesanan Anda.", preorderUbe: "Pengiriman untuk {date} tersedia untuk penduduk Kota Ube. Silakan lanjutkan pesanan Anda.", dbError: "Kesalahan koneksi database. Pesanan tidak dapat disimpan karena Firebase tidak dikonfigurasi.", orderError: "Terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi.", passwordIncorrect: "Kata sandi salah.", signupBenefit: "Daftar untuk melewati pengisian info pengiriman setiap saat & dapatkan kupon ¥100!", subtotalLabel: "Subtotal", discountLabel: "Diskon Kupon", applyCouponBtn: "Gunakan Kupon ¥100", couponApplied: "✓ Kupon Digunakan", myCoupons: "Kupon Saya",  myOrders: "Riwayat Pesanan", welcomeCoupon: "Kupon Selamat Datang ¥100 OFF", noCoupons: "Anda tidak memiliki kupon yang tersedia.", whatIsHalalTitle: "Apa itu Makanan Halal?", whatIsHalalDesc: "Halal adalah kata dalam bahasa Arab yang berarti 'diperbolehkan' menurut hukum Islam. Agar makanan dapat disertifikasi sebagai Halal, makanan tersebut harus mematuhi serangkaian aturan ketat mengenai bahan dan metode persiapan. Ini memastikan bahwa makanan tersebut bersih, suci, dan disiapkan dengan cara yang manusiawi." 
    }
};

// --- menuItemsにカテゴリ情報を追加しました ---
const menuItems = [
    { id: 1, name_en: "Halal Tonkotsu Ramen", name_ja: "ハラール豚骨ラーメン", name_id: "Ramen Tonkotsu Halal", price: 1250, description_en: "Our signature ramen with a rich, creamy pork-free broth, topped with chicken chashu, menma, and a seasoned egg.", description_ja: "当店自慢のラーメン。豚を使わない濃厚でクリーミーなスープに、鶏チャーシュー、メンマ、味玉をトッピングしました。", description_id: "Ramen andalan kami dengan kaldu kaya krim bebas babi, dengan topping chashu ayam, menma, dan telur berbumbu.", imageUrl: "http://googleusercontent.com/image_generation_content/1", category: "japanese" }, 
    { id: 2, name_en: "Nasi Goreng", name_ja: "ナシゴレン", name_id: "Nasi Goreng", price: 1100, description_en: "Classic Indonesian fried rice with sweet soy sauce, chicken, and a fried egg on top.", description_ja: "定番のインドネシア風チャーハン。甘い醤油と鶏肉で炒め、目玉焼きを乗せました。", description_id: "Nasi goreng klasik Indonesia dengan kecap manis, ayam, dan telur mata sapi di atasnya.", imageUrl: "https://images.unsplash.com/photo-1599602235011-95b62a773f77?q=80&w=2849&auto=format&fit=crop", category: "indonesian" }, 
    { id: 3, name_en: "Chicken Satay (5 Skewers)", name_ja: "チキンサテー（5本）", name_id: "Sate Ayam (5 Tusuk)", price: 800, description_en: "Tender, marinated chicken skewers, grilled to perfection and served with a rich peanut sauce.", description_ja: "柔らかく味付けした鶏肉の串焼き。香ばしく焼き上げ、濃厚なピーナッツソースを添えて。", description_id: "Sate ayam empuk yang direndam bumbu, dipanggang sempurna dan disajikan dengan saus kacang yang kaya.", imageUrl: "https://images.unsplash.com/photo-1626084469318-26122a751593?q=80&w=2940&auto=format&fit=crop", category: "indonesian" }, 
    { id: 4, name_en: "Beef Rendang", name_ja: "ビーフ・ルンダン", name_id: "Rendang Sapi", price: 1600, description_en: "Slow-cooked beef in a fragrant mixture of coconut milk and spices until tender and flavorful.", description_ja: "牛肉をココナッツミルクとスパイスで柔らかくなるまでじっくり煮込んだ、風味豊かな一品。", description_id: "Daging sapi yang dimasak perlahan dalam campuran santan dan rempah-rempah yang harum hingga empuk dan beraroma.", imageUrl: "https://images.unsplash.com/photo-1626084474384-5893557a5fb2?q=80&w=2940&auto=format&fit=crop", category: "indonesian" }, 
    { id: 5, name_en: "Halal Gyoza (6 pcs)", name_ja: "ハラール餃子（6個）", name_id: "Gyoza Halal (6 buah)", price: 650, description_en: "Pan-fried dumplings filled with minced chicken and vegetables, served with a soy-vinegar dipping sauce.", description_ja: "鶏ひき肉と野菜を詰めた焼き餃子。酢醤油の特製だれでお召し上がりください。", description_id: "Pangsit goreng berisi ayam cincang dan sayuran, disajikan dengan saus celup cuka kedelai.", imageUrl: "https://images.unsplash.com/photo-1631783321568-9a35622fa22b?q=80&w=2787&auto=format&fit=crop", category: "japanese" }, 
    { id: 6, name_en: "Mango Lassi", name_ja: "マンゴーラッシー", name_id: "Lassi Mangga", price: 500, description_en: "A refreshing and creamy yogurt drink blended with sweet, ripe mangoes.", description_ja: "甘く熟したマンゴーをブレンドした、爽やかでクリーミーなヨーグルトドリンク。", description_id: "Minuman yogurt krim yang menyegarkan dicampur dengan mangga matang yang manis.", imageUrl: "https://images.unsplash.com/photo-1626803364123-0176e053d231?q=80&w=2787&auto=format&fit=crop", category: "drinks" }, 
    { id: 7, name_en: "Matcha Parfait", name_ja: "抹茶パフェ", name_id: "Parfait Matcha", price: 850, description_en: "Rich matcha flavor with traditional Japanese sweet elements.", description_ja: "濃厚な抹茶の風味と和の甘みが絶妙なパフェ。", description_id: "Rasa matcha yang kaya dengan elemen manis tradisional Jepang.", imageUrl: "https://via.placeholder.com/400x250/F0F0F0/000000?text=Matcha+Parfait", category: "sweets" },
    { id: 8, name_en: "Warabi Mochi", name_ja: "わらび餅", name_id: "Warabi Mochi", price: 600, description_en: "Meltingly soft bracken-starch dumplings with kinako and black sugar syrup.", description_ja: "とろけるような食感のわらび餅。きな粉と黒蜜で。", description_id: "Kue mochi pati pakis yang meleleh lembut dengan kinako dan sirup gula aren hitam.", imageUrl: "https://via.placeholder.com/400x250/F0F0F0/000000?text=Warabi+Mochi", category: "sweets" },
    { id: 9, name_en: "Green Tea", name_ja: "緑茶", name_id: "Teh Hijau", price: 300, description_en: "Refreshing Japanese green tea, perfect with any meal.", description_ja: "食事に合うすっきりとした緑茶。", description_id: "Teh hijau Jepang yang menyegarkan, cocok dengan hidangan apa pun.", imageUrl: "https://via.placeholder.com/400x250/F0F0F0/000000?text=Green+Tea", category: "drinks" },
    { id: 10, name_en: "Iced Coffee", name_ja: "アイスコーヒー", name_id: "Kopi Es", price: 450, description_en: "A classic cold coffee to cool you down.", description_ja: "定番の冷たいコーヒーで一息。", description_id: "Kopi dingin klasik untuk mendinginkan Anda.", imageUrl: "https://via.placeholder.com/400x250/F0F0F0/000000?text=Iced+Coffee", category: "drinks" }
];
let cart = [];
let selectedPreOrder = { date: null, city: null };
let currentUser = null;
let currentUserData = null;
let currentLang = 'en';
let isCouponApplied = false;
    
// --- App Initialization & Main Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const dom = { 
        searchBar: document.getElementById('search-bar'),
        calendarGrid: document.getElementById('calendar-grid'),
        preorderStatus: document.getElementById('preorder-status'),
        cartButton: document.getElementById('cart-button'), mobileCartButton: document.getElementById('mobile-cart-button'), cartSidebar: document.getElementById('cart-sidebar'), closeCartButton: document.getElementById('close-cart-button'), cartItemsContainer: document.getElementById('cart-items'), cartTotalElement: document.getElementById('cart-total'), cartSubtotalElement: document.getElementById('cart-subtotal'), discountRow: document.getElementById('discount-row'), cartDiscountElement: document.getElementById('cart-discount'), couponSection: document.getElementById('coupon-section'), applyCouponButton: document.getElementById('apply-coupon-button'), cartCountElements: [document.getElementById('cart-count'), document.getElementById('mobile-cart-count')], emptyCartMessage: document.getElementById('empty-cart-message'), checkoutButton: document.getElementById('checkout-button'), checkoutModal: document.getElementById('checkout-modal'), closeCheckoutModalButton: document.getElementById('close-checkout-modal-button'), checkoutForm: document.getElementById('checkout-form'), checkoutTotalElement: document.getElementById('checkout-total'), formError: document.getElementById('form-error'), successModal: document.getElementById('success-modal'), closeSuccessModalButton: document.getElementById('close-success-modal-button'), adminPanelButton: document.getElementById('admin-panel-button'), adminModal: document.getElementById('admin-modal'), closeAdminModalButton: document.getElementById('close-admin-modal-button'), orderListContainer: document.getElementById('order-list'), authLinksDesktop: document.getElementById('auth-links-desktop'), userLinksDesktop: document.getElementById('user-links-desktop'), welcomeMessageDesktop: document.getElementById('welcome-message-desktop'), authLinksMobile: document.getElementById('auth-links-mobile'), userLinksMobile: document.getElementById('user-links-mobile'), welcomeMessageMobile: document.getElementById('welcome-message-mobile'), signupModal: document.getElementById('signup-modal'), loginModal: document.getElementById('login-modal'), accountModal: document.getElementById('account-modal'), languageSwitcher: document.getElementById('language-switcher'), languageSwitcherMobile: document.getElementById('language-switcher-mobile'), mobileMenu: document.getElementById('mobile-menu'), mobileMenuButton: document.getElementById('mobile-menu-button'), closeMobileMenuButton: document.getElementById('close-mobile-menu-button'), contactForm: document.getElementById('contact-form'), contactFormFeedback: document.getElementById('contact-form-feedback'), contactSubmitButton: document.getElementById('contact-submit-button'), myCouponsList: document.getElementById('my-coupons-list'),
        myOrdersList: document.getElementById('my-orders-list'), // 新しくDOM要素を追加
        // メニューカテゴリ関連のDOM要素を追加
        menuButtons: document.querySelectorAll('.menu-button'),
        menuDisplayArea: document.getElementById('menu-display-area')
    };
    loadCartFromLocalStorage();

    // --- Functions ---
    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
            } catch (e) {
                console.error("カート情報の復元に失敗しました: ", e);
                cart = [];
            }
        }
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    const showAuthError = (modal, message) => { const errorEl = document.getElementById(`${modal}-error`); errorEl.textContent = message; errorEl.classList.remove('hidden'); };
    const closeAuthModal = (modalId) => { const modal = document.getElementById(modalId); modal.classList.add('hidden'); modal.querySelector('.auth-modal-content').classList.add('scale-95'); document.body.style.overflow = 'auto'; };
    const openAuthModal = (modalId) => { const modal = document.getElementById(modalId); modal.classList.remove('hidden'); setTimeout(() => modal.querySelector('.auth-modal-content').classList.remove('scale-95'), 10); document.body.style.overflow = 'hidden'; };
        
    function updateLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.dataset.key;
            if (translations[lang][key]) {
                if (key === 'calendarTitle') {
                    const today = new Date();
                    const monthStr = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long' }).format(today);
                    el.innerHTML = translations[lang][key].replace('{month}', monthStr);
                } else if (el.placeholder) {
                    el.placeholder = translations[lang][key];
                } else {
                    el.innerHTML = translations[lang][key];
                }
            }
        });

        // メニューカテゴリボタンのテキストを更新
        dom.menuButtons.forEach(button => {
            const key = button.dataset.key;
            if (translations[lang][key]) {
                button.textContent = translations[lang][key];
            }
        });

        // 言語ボタンのハイライトを更新
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(btn => {
            btn.classList.add('active');
        });

        renderAllCategoryMenus(); // 全てのカテゴリメニューを言語変更時に再レンダリング
        const today = new Date();
        generateCalendar(today.getFullYear(), today.getMonth() + 1);
        updateCart();
        localStorage.setItem('language', lang);
    }
        
    function generateCalendar(year, month) { dom.calendarGrid.innerHTML = ''; const monthIndex = month - 1; const firstDay = new Date(year, monthIndex, 1).getDay(); const daysInMonth = new Date(year, month, 0).getDate(); const weekDays = currentLang === 'ja' ? ['日', '月', '火', '水', '木', '金', '土'] : (currentLang === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']); weekDays.forEach(day => { const dayHeader = document.createElement('div'); dayHeader.className = 'font-bold text-gray-700 p-2'; dayHeader.textContent = day; dom.calendarGrid.appendChild(dayHeader); }); for (let i = 0; i < firstDay; i++) { dom.calendarGrid.appendChild(document.createElement('div')); } for (let day = 1; day <= daysInMonth; day++) { const dayCell = document.createElement('div'); const date = new Date(year, monthIndex, day); const dayOfWeek = date.getDay(); dayCell.className = 'calendar-day p-2 rounded-lg border border-gray-200 flex flex-col justify-between h-24 sm:h-28'; let contentHTML = `<span class="font-bold">${day}</span>`; let city = null; let cityKey = ''; if (dayOfWeek === 6) { dayCell.classList.add('bg-blue-50', 'preorder-day'); city = 'Yamaguchi City'; cityKey = 'preorderYamaguchi'; } else if (dayOfWeek === 0) { dayCell.classList.add('bg-red-50', 'preorder-day'); city = 'Ube City'; cityKey = 'preorderUbe'; } else { dayCell.classList.add('bg-gray-50'); } dayCell.innerHTML = contentHTML + (city ? `<span class="text-sm font-semibold ${dayOfWeek === 6 ? 'text-blue-700' : 'text-red-700'} mt-auto">${city}</span>` : ''); if (city) { dayCell.addEventListener('click', () => { document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected')); dayCell.classList.add('selected'); const dateString = new Intl.DateTimeFormat(currentLang, { month: 'long', day: 'numeric' }).format(date); selectedPreOrder = { date: dateString, city: city }; dom.preorderStatus.textContent = translations[currentLang][cityKey].replace('{date}', dateString); }); } dom.calendarGrid.appendChild(dayCell); } }
        
    function renderMenu(itemsToRender, targetContainerId) { 
        const targetContainer = document.getElementById(targetContainerId);
        if (!targetContainer) {
            console.warn(`Target container with ID ${targetContainerId} not found for rendering.`);
            return;
        }
        targetContainer.innerHTML = ''; 

        if (itemsToRender.length === 0) {
            targetContainer.innerHTML = `<p class="text-gray-600 col-span-full text-center">${translations[currentLang].noMatchingDishes || 'No matching dishes found.'}</p>`;
            return;
        }

        itemsToRender.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-lg overflow-hidden flex flex-col'; 
            const name = item[`name_${currentLang}`] || item.name_en;
            const description = item[`description_${currentLang}`] || item.description_en;
            const addBtnText = translations[currentLang].addBtn || 'Add'; // 「追加」ボタンのテキストを取得
            card.innerHTML = `
                <div class="h-48 overflow-hidden">
                    <img src="${item.imageUrl}" alt="${name}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/600x400/cccccc/ffffff?text=${encodeURIComponent(name)}';">
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="font-bold text-xl mb-2 text-gray-800">${name}</h3>
                    <p class="text-gray-600 mb-4 text-sm flex-grow">${description}</p>
                    <div class="flex justify-between items-center mt-auto">
                        <span class="text-green-600 font-bold text-lg">¥${item.price.toLocaleString()}</span>
                        <button data-item-id="${item.id}" class="add-to-cart-button bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-full hover:bg-green-200 transition">${addBtnText} <i class="fas fa-plus ml-1"></i></button>
                    </div>
                </div>
            `;
            targetContainer.appendChild(card);
        });
    }

    function renderAllCategoryMenus() {
        const categories = ['japanese', 'indonesian', 'sweets', 'drinks'];
        categories.forEach(category => {
            const categoryItems = menuItems.filter(item => item.category === category);
            renderMenu(categoryItems, `${category}-menu-grid`); 
        });
    }

    function addToCart(e) {
        const button = e.target.closest('.add-to-cart-button');
        if (!button) return;

        const card = button.closest('.bg-white.rounded-lg.shadow-lg'); 
        const itemImage = card.querySelector('img');
        
        // 現在表示されているカートアイコン（デスクトップ用またはモバイル用）を検出
        let cartIcon = null;
        if (dom.cartButton && dom.cartButton.offsetParent !== null) { // offsetParentがnullでない場合、要素が表示されている
            cartIcon = dom.cartButton;
        } else if (dom.mobileCartButton && dom.mobileCartButton.offsetParent !== null) {
            cartIcon = dom.mobileCartButton;
        }

        if (itemImage && cartIcon) {
            const imageRect = itemImage.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();
            
            const flyingImage = itemImage.cloneNode();
            flyingImage.classList.add('flying-image');
            
            // 初期の位置を設定
            flyingImage.style.width = `${imageRect.width}px`;
            flyingImage.style.height = `${imageRect.height}px`;
            flyingImage.style.top = `${imageRect.top}px`;
            flyingImage.style.left = `${imageRect.left}px`;
            document.body.appendChild(flyingImage);

            requestAnimationFrame(() => {
                // ターゲット位置をカートアイコンの中央に設定
                const targetX = cartRect.left + cartRect.width / 2 - 15; // 飛行画像の幅の半分を引く (ここでは適当な値15pxを使用)
                const targetY = cartRect.top + cartRect.height / 2 - 15; // 飛行画像の高さの半分を引く

                flyingImage.style.width = '30px';
                flyingImage.style.height = '30px';
                flyingImage.style.top = `${targetY}px`;
                flyingImage.style.left = `${targetX}px`;
                flyingImage.style.opacity = '0';
            });

            cartIcon.classList.add('cart-shake');
            setTimeout(() => {
                flyingImage.remove();
                cartIcon.classList.remove('cart-shake');
            }, 700);
        }

        const itemId = parseInt(button.dataset.itemId);
        const menuItem = menuItems.find(m => m.id === itemId);
        const existingCartItem = cart.find(item => item.id === itemId);

        if (existingCartItem) {
            existingCartItem.quantity++;
        } else {
            cart.push({ ...menuItem, quantity: 1 });
        }
        updateCart();

        button.innerHTML = `<i class="fas fa-check"></i> ${translations[currentLang].addedBtn || 'Added'}`;
        button.classList.add("bg-green-500", "text-white");
        setTimeout(() => {
            button.innerHTML = `${translations[currentLang].addBtn || 'Add'} <i class="fas fa-plus ml-1"></i>`; // 戻り値も多言語対応
            button.classList.remove("bg-green-500", "text-white");
        }, 1500);
    }
    function updateCart() { if (cart.length === 0) { dom.cartItemsContainer.innerHTML = ''; dom.emptyCartMessage.classList.remove('hidden'); dom.couponSection.classList.add('hidden'); } else { dom.emptyCartMessage.classList.add('hidden'); dom.cartItemsContainer.innerHTML = ''; cart.forEach(t => { const e = document.createElement('div'); e.className = 'flex justify-between items-center py-3 border-b'; e.innerHTML = `<div class="flex-grow"><p class="font-semibold">${t[`name_${currentLang}`] || t.name_en}</p><p class="text-sm text-gray-600">¥${t.price.toLocaleString()}</p></div><div class="flex items-center space-x-3"><button class="quantity-change-button text-gray-500" data-item-id="${t.id}" data-change="-1">-</button><span>${t.quantity}</span><button class="quantity-change-button text-gray-500" data-item-id="${t.id}" data-change="1">+</button></div><p class="w-20 text-right font-semibold">¥${(t.price * t.quantity).toLocaleString()}</p>`; dom.cartItemsContainer.appendChild(e); }); } updateCouponUI(); const subtotal = cart.reduce((t, e) => t + e.price * e.quantity, 0); const discount = isCouponApplied && currentUserData?.hasCoupon ? 100 : 0; const total = subtotal - discount; dom.cartSubtotalElement.textContent = `¥${subtotal.toLocaleString()}`; dom.cartDiscountElement.textContent = `- ¥${discount.toLocaleString()}`; dom.discountRow.classList.toggle('hidden', discount === 0); dom.cartTotalElement.textContent = `¥${total.toLocaleString()}`; const e = cart.reduce((t, e) => t + e.quantity, 0); dom.cartCountElements.forEach(t => { t.textContent = e; t.classList.toggle('hidden', e === 0); }); dom.checkoutButton.disabled = cart.length === 0; saveCartToLocalStorage(); }
    function handleQuantityChange(e) { const t = e.target.closest('.quantity-change-button'); if (!t) return; const a = parseInt(t.dataset.itemId), n = parseInt(t.dataset.change), s = cart.findIndex(t => t.id === a); s > -1 && (cart[s].quantity += n, cart[s].quantity <= 0 && cart.splice(s, 1)); isCouponApplied = false; updateCart(); }
    function openCart() { dom.cartSidebar.classList.remove('translate-x-full'); }
    function closeCart() { dom.cartSidebar.classList.add('translate-x-full'); }
    async function openCheckoutModal() { const total = cart.reduce((t, e) => t + e.price * e.quantity, 0); const emailInput = document.getElementById('customer-email'); dom.checkoutTotalElement.textContent = `¥${total.toLocaleString()}`; if (currentUser) { const userDoc = await getDoc(doc(db, "users", currentUser.uid)); if (userDoc.exists()) { const userData = userDoc.data(); document.getElementById('customer-name').value = userData.name || ''; document.getElementById('customer-phone').value = userData.phone || ''; document.getElementById('customer-address').value = userData.address || ''; } emailInput.value = currentUser.email; emailInput.readOnly = true; emailInput.classList.add('bg-gray-100', 'cursor-not-allowed'); } else { dom.checkoutForm.reset(); emailInput.readOnly = false; emailInput.classList.remove('bg-gray-100', 'cursor-not-allowed'); } dom.checkoutModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; setTimeout(() => document.getElementById('checkout-modal-content').classList.remove('scale-95'), 10); }
    function closeCheckoutModal() { document.getElementById('checkout-modal-content').classList.add('scale-95'); dom.checkoutModal.classList.add('hidden'); document.body.style.overflow = 'auto'; dom.formError.classList.add('hidden'); }
    async function handleOrderSubmit(e) { 
        e.preventDefault(); 
        const confirmButton = document.getElementById('confirm-order-button'); 
        if (!dom.checkoutForm.checkValidity()) { 
            dom.formError.classList.remove('hidden'); 
            return; 
        } 
        dom.formError.classList.add('hidden'); 
        const originalButtonText = confirmButton.innerHTML; 
        confirmButton.disabled = true; 
        confirmButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Loading...`; 
        
        if (!db) { 
            alert(translations[currentLang].dbError); 
            confirmButton.disabled = false; 
            confirmButton.innerHTML = originalButtonText; 
            return; 
        } 
        
        const formData = new FormData(dom.checkoutForm); 
        const customerDetails = Object.fromEntries(formData.entries()); 
        const orderItems = cart.map(item => ({ 
            name: item[`name_${currentLang}`] || item.name_en, // 注文時の言語で保存
            quantity: item.quantity, 
            price: item.price 
        })); 
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); 
        const discount = isCouponApplied && currentUserData?.hasCoupon ? 100 : 0; 
        const orderTotal = subtotal - discount; 
        
        const orderData = { 
            customerInfo: customerDetails, 
            items: orderItems, 
            subtotal: subtotal, 
            discount: discount, 
            total: orderTotal, 
            createdAt: serverTimestamp(), 
            userId: currentUser ? currentUser.uid : 'guest' 
        }; 
        if (selectedPreOrder.date) { 
            orderData.preOrderInfo = selectedPreOrder; 
        } 
        try { 
            const saveDataPromise = addDoc(collection(db, "orders"), orderData); 
            const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000)); 
            await Promise.all([saveDataPromise, minDelayPromise]); 
            
            if (isCouponApplied && currentUser) { 
                await setDoc(doc(db, "users", currentUser.uid), { hasCoupon: false }, { merge: true }); 
                currentUserData.hasCoupon = false; 
            } 
            
            closeCheckoutModal(); 
            showSuccessModal(); 
            closeCart(); 
            cart = []; 
            selectedPreOrder = { date: null, city: null }; 
            isCouponApplied = false; 
            dom.preorderStatus.textContent = ''; 
            document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected')); 
            updateCart(); 
            dom.checkoutForm.reset(); 
        } catch (err) { 
            console.error("Error saving order: ", err); 
            alert(translations[currentLang].orderError); 
        } finally { 
            confirmButton.disabled = false; 
            confirmButton.innerHTML = originalButtonText; 
        } 
    }
    async function handleContactSubmit(e) { e.preventDefault(); const submitButton = dom.contactSubmitButton; if (!dom.contactForm.checkValidity()) { return; } const originalButtonText = submitButton.innerHTML; submitButton.disabled = true; submitButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Loading...`; if (!db) { alert(translations[currentLang].dbError); submitButton.disabled = false; submitButton.innerHTML = originalButtonText; return; } const name = document.getElementById('contact-name').value; const email = document.getElementById('contact-email').value; const message = document.getElementById('contact-message').value; try { await addDoc(collection(db, "inquiries"), { name, email, message, createdAt: serverTimestamp() }); dom.contactFormFeedback.textContent = translations[currentLang].messageSuccess; dom.contactFormFeedback.classList.remove('text-red-500'); dom.contactFormFeedback.classList.add('text-green-600'); dom.contactForm.reset(); } catch (err) { console.error("Error saving inquiry: ", err); dom.contactFormFeedback.textContent = translations[currentLang].orderError; dom.contactFormFeedback.classList.add('text-red-500'); dom.contactFormFeedback.classList.remove('text-green-600'); } finally { setTimeout(() => { dom.contactFormFeedback.textContent = ''; submitButton.disabled = false; submitButton.innerHTML = originalButtonText; }, 4000); } }
    function showSuccessModal() { dom.successModal.classList.remove('hidden'); }
    function closeSuccessModal() { dom.successModal.classList.add('hidden'); }
        
    // --- ユーザーの注文履歴をロードする関数 ---
    async function loadUserOrders(userId) {
        if (!db || !userId) {
            dom.myOrdersList.innerHTML = `<p class="text-gray-500 text-sm">${translations[currentLang].noOrders || 'No orders found.'}</p>`;
            return;
        }

        try {
            // Firestoreから現在のユーザーの注文を取得 (createdAtで降順ソート)
            const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
            
            // リアルタイムリスナーではなく、一度だけデータを取得
            const querySnapshot = await getDocs(q); // getDocsを使うように変更

            if (querySnapshot.empty) {
                dom.myOrdersList.innerHTML = `<p class="text-gray-500 text-sm">${translations[currentLang].noOrders || 'You have no orders yet.'}</p>`;
                return;
            }

            let ordersHtml = '';
            querySnapshot.forEach(doc => {
                const order = doc.data();
                const orderId = doc.id;
                const orderDate = order.createdAt ? order.createdAt.toDate().toLocaleString(currentLang) : 'N/A';
                const total = order.total.toLocaleString();

                const itemsHtml = order.items.map(item => `
                    <li class="flex justify-between text-sm text-gray-600">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>¥${item.price.toLocaleString()}</span>
                    </li>
                `).join('');

                ordersHtml += `
                    <div class="border p-4 rounded-lg shadow-sm bg-gray-50">
                        <div class="flex justify-between items-center mb-2">
                            <p class="font-semibold text-gray-700">${translations[currentLang].orderId || 'Order ID'}: ${orderId}</p>
                            <p class="text-sm text-gray-500">${orderDate}</p>
                        </div>
                        <ul class="list-none p-0 m-0 space-y-1">
                            ${itemsHtml}
                        </ul>
                        <div class="flex justify-between items-center border-t pt-2 mt-2">
                            <span class="font-bold text-gray-800">${translations[currentLang].cartTotal || 'Total'}:</span>
                            <span class="font-bold text-green-600">¥${total}</span>
                        </div>
                        ${order.preOrderInfo ? `
                            <p class="text-xs text-blue-600 mt-2">
                                ${translations[currentLang].preorderInfo || 'Pre-order'}: ${order.preOrderInfo.date} (${order.preOrderInfo.city})
                            </p>
                        ` : ''}
                    </div>
                `;
            });
            dom.myOrdersList.innerHTML = ordersHtml;

        } catch (error) {
            console.error("Error loading user orders:", error);
            dom.myOrdersList.innerHTML = `<p class="text-red-500 text-sm">${translations[currentLang].orderLoadError || 'Failed to load orders.'}</p>`;
        }
    }

    function openAdminPanel() {
        // ★★★★★【重要】この行のUIDを、あなた自身の管理者アカウントのUIDに必ず書き換えてください！
        const adminUID = 'rgKDs7T8tsdoDQigLLX2CkGprx62';

        if (currentUser && currentUser.uid === adminUID) {
            if (!db) { alert("Database connection error."); return; }
            dom.adminModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            loadOrders(); // 管理者パネルの注文履歴は引き続き loadOrders で表示
        } else {
            alert("管理者権限がありません。");
        }
    }

    function closeAdminPanel() { dom.adminModal.classList.add('hidden'); document.body.style.overflow = 'auto'; }
    // 注意: この loadOrders 関数は管理者パネル用です。ユーザーのマイアカウントの注文履歴には loadUserOrders を使います。
    function loadOrders() { if (!db) return; const t = query(collection(db, "orders"), orderBy("createdAt", "desc")); onSnapshot(t, t => { if (t.empty) { dom.orderListContainer.innerHTML = '<p class="text-center text-gray-500">No orders yet.</p>'; return; } dom.orderListContainer.innerHTML = ''; t.forEach(t => { const e = t.data(), a = document.createElement('div'); a.className = "bg-white p-4 rounded-lg shadow mb-4"; const n = e.items.map(item => `<li>${item.name} (x${item.quantity}) - ¥${(item.price * item.quantity).toLocaleString()}</li>`).join(''); let s = ''; e.preOrderInfo && (s = `<div class="mt-2 p-2 bg-green-100 rounded-md"><p class="font-semibold text-green-800">Pre-Order: ${e.preOrderInfo.date} (for ${e.preOrderInfo.city})</p></div>`); a.innerHTML = ` <div class="flex justify-between items-start"> <div> <p class="font-bold text-lg">Order ID: ${t.id}</p> <p class="text-sm text-gray-500">Date: ${e.createdAt ? e.createdAt.toDate().toLocaleString("en-US") : 'N/A'}</p> </div> <p class="font-bold text-xl text-green-600">Total: ¥${e.total.toLocaleString()}</p> </div> ${s} <div class="mt-4 border-t pt-4"> <h4 class="font-semibold">Customer Info:</h4> <p><strong>Name:</strong> ${e.customerInfo.name}</p> <p><strong>Phone:</strong> ${e.customerInfo.phone}</p> <p><strong>Email:</strong> ${e.customerInfo.email}</p> <p><strong>Address:</strong> ${e.customerInfo.address}</p> </div> <div class="mt-4 border-t pt-4"> <h4 class="font-semibold">Order Details:</h4> <ul class="list-disc list-inside">${n}</ul> </div> `; dom.orderListContainer.appendChild(a); }); }); }
        
    function filterMenu() {
        const query = dom.searchBar.value.toLowerCase();
        const activeMenuContent = document.querySelector('.menu-content.active');
        
        if (!activeMenuContent) {
            return; 
        }

        const currentCategory = activeMenuContent.id.replace('-menu', '');
        const filtered = menuItems.filter(item => 
            item.category === currentCategory && 
            (item.name_en.toLowerCase().includes(query) || 
             item.name_ja.toLowerCase().includes(query) || 
             item.name_id.toLowerCase().includes(query))
        );
        
        renderMenu(filtered, `${currentCategory}-menu-grid`); 
    }

    function updateUIForAuthState(user, userData) {
        currentUserData = userData;
        const name = userData ? userData.name : 'User';
        const userName = name ? name.split(' ')[0] : 'User';
        const welcomeText = `${translations[currentLang].welcome || 'Welcome'}, ${userName}!`;
        if (user) {
            [dom.authLinksDesktop, dom.authLinksMobile].forEach(el => el.classList.add('hidden'));
            [dom.userLinksDesktop, dom.userLinksMobile].forEach(el => el.classList.remove('hidden'));
            dom.welcomeMessageDesktop.textContent = welcomeText;
            dom.welcomeMessageMobile.textContent = welcomeText;
            // ログイン時にマイアカウントの注文履歴をロード
            loadUserOrders(user.uid); 
        } else {
            [dom.authLinksDesktop, dom.authLinksMobile].forEach(el => el.classList.remove('hidden'));
            [dom.userLinksDesktop, dom.userLinksMobile].forEach(el => el.classList.add('hidden'));
            // ログアウト時に注文履歴をクリア
            if (dom.myOrdersList) dom.myOrdersList.innerHTML = `<p class="text-gray-500 text-sm">${translations[currentLang].loginToSeeOrders || 'Log in to see your orders.'}</p>`;
        }
        updateCart();
    }
    function updateCouponUI() {
        if (currentUserData && currentUserData.hasCoupon) {
            dom.couponSection.classList.remove('hidden');
            dom.applyCouponButton.disabled = isCouponApplied;
            dom.applyCouponButton.innerHTML = isCouponApplied ? `<i class="fas fa-check-circle mr-2"></i>${translations[currentLang].couponApplied}` : translations[currentLang].applyCouponBtn;
        } else {
            dom.couponSection.classList.add('hidden');
        }
    }

    function startHeroSlideshow() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const slideshowImages = [
            'ramen.png',
            'lassi.png'
        ];         
        slideshowImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        let currentImageIndex = 0;
        heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${slideshowImages[currentImageIndex]}')`;

        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % slideshowImages.length;
            heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${slideshowImages[currentImageIndex]}')`;
        }, 5000);
    }

    // --- Event Listener Bindings ---
    const savedLang = localStorage.getItem('language') || 'en'; 
    // 初回ロード時に言語設定を適用
    updateLanguage(savedLang); 
        
    if(auth) {
        onAuthStateChanged(auth, async (user) => { 
            if (user) { 
                currentUser = user; 
                const userDoc = await getDoc(doc(db, "users", user.uid)); 
                updateUIForAuthState(user, userDoc.exists() ? userDoc.data() : null); 
                // ここで loadUserOrders を呼び出すことで、ユーザー情報がロードされた後に履歴が読み込まれる
                loadUserOrders(user.uid); 
            } else { 
                currentUser = null; 
                updateUIForAuthState(null); 
            } 
        });
        document.getElementById('signup-form').addEventListener('submit', async (e) => { e.preventDefault(); const name = e.target['signup-name'].value; const email = e.target['signup-email'].value; const password = e.target['signup-password'].value; try { const userCredential = await createUserWithEmailAndPassword(auth, email, password); await sendEmailVerification(userCredential.user); await setDoc(doc(db, "users", userCredential.user.uid), { name: name, email: email, phone: '', address: '', hasCoupon: true }); closeAuthModal('signup-modal'); } catch (error) { showAuthError('signup', error.message); } });
        document.getElementById('login-form').addEventListener('submit', async (e) => { e.preventDefault(); const email = e.target['login-email'].value; const password = e.target['login-password'].value; try { await signInWithEmailAndPassword(auth, email, password); closeAuthModal('login-modal'); } catch (error) { showAuthError('login', error.message); } });
        document.getElementById('account-form').addEventListener('submit', async (e) => { e.preventDefault(); if (!currentUser) return; const name = e.target['account-name'].value; const phone = e.target['account-phone'].value; const address = e.target['account-address'].value; try { await setDoc(doc(db, "users", currentUser.uid), { name, phone, address }, { merge: true }); const successMsg = document.getElementById('account-success'); successMsg.classList.remove('hidden'); setTimeout(() => successMsg.classList.add('hidden'), 3000); } catch (error) { showAuthError('account', error.message); } });
            
        [document.getElementById('logout-button-desktop'), document.getElementById('logout-button-mobile')].forEach(btn => btn.addEventListener('click', () => { signOut(auth); dom.mobileMenu.classList.add('hidden'); }));
        [document.getElementById('account-button-desktop'), document.getElementById('account-button-mobile')].forEach(btn => btn.addEventListener('click', async () => { 
            if (!currentUser) return; 
            dom.mobileMenu.classList.add('hidden'); 
            const userDoc = await getDoc(doc(db, "users", currentUser.uid)); 
            if (userDoc.exists()) { 
                currentUserData = userDoc.data(); 
            } else { 
                currentUserData = { name: '', phone: '', address: '', hasCoupon: false }; 
            } 
            document.getElementById('account-name').value = currentUserData.name || ''; 
            document.getElementById('account-phone').value = currentUserData.phone || ''; 
            document.getElementById('account-address').value = currentUserData.address || ''; 
            const couponList = dom.myCouponsList; 
            couponList.innerHTML = ''; 
            if (currentUserData && currentUserData.hasCoupon) { 
                couponList.innerHTML = `<div class="bg-orange-100 border border-orange-200 text-orange-800 text-sm rounded-lg p-3 flex items-center"><i class="fas fa-ticket-alt mr-3"></i><span>${translations[currentLang].welcomeCoupon}</span></div>`; 
            } else { 
                couponList.innerHTML = `<p class="text-gray-500 text-sm">${translations[currentLang].noCoupons}</p>`; 
            } 
            
            // マイアカウントを開くときに注文履歴をロードする
            await loadUserOrders(currentUser.uid); // ここで await を追加して、確実に読み込みが終わるまで待つ
            openAuthModal('account-modal'); 
        }));
        [document.getElementById('signup-button-desktop'), document.getElementById('signup-button-mobile')].forEach(btn => btn.addEventListener('click', () => { openAuthModal('signup-modal'); dom.mobileMenu.classList.add('hidden'); }));
        [document.getElementById('login-button-desktop'), document.getElementById('login-button-mobile')].forEach(btn => btn.addEventListener('click', () => { openAuthModal('login-modal'); dom.mobileMenu.classList.add('hidden'); }));
    }
        
    dom.menuDisplayArea.addEventListener('click', addToCart); 

    [dom.languageSwitcher, dom.languageSwitcherMobile].forEach(switcher => switcher.addEventListener('click', (e) => { 
        const lang = e.target.closest('.lang-btn')?.dataset.lang; 
        if(lang) {
            updateLanguage(lang);
            // 言語切り替え時に、現在のカテゴリボタンを再アクティブ化
            const currentActiveButton = document.querySelector('.menu-button.active-menu-button');
            if (currentActiveButton) {
                currentActiveButton.click(); 
            } else {
                // アクティブなボタンがない場合（初回ロード時など）、デフォルトで日本料理をアクティブにする
                const initialButton = document.querySelector('.menu-button[data-menu="japanese"]');
                if (initialButton) {
                    initialButton.click(); 
                }
            }
        }
    }));
    document.getElementById('close-signup-modal-button').addEventListener('click', () => closeAuthModal('signup-modal'));
    document.getElementById('close-login-modal-button').addEventListener('click', () => closeAuthModal('login-modal'));
    document.getElementById('close-account-modal-button').addEventListener('click', () => closeAuthModal('account-modal'));
    dom.closeCheckoutModalButton.addEventListener('click', closeCheckoutModal); dom.checkoutModal.addEventListener('click', e => e.target === dom.checkoutModal && closeCheckoutModal());
    dom.closeSuccessModalButton.addEventListener('click', closeSuccessModal);
    dom.cartButton.addEventListener('click', openCart); dom.mobileCartButton.addEventListener('click', openCart); dom.closeCartButton.addEventListener('click', closeCart);
    dom.cartItemsContainer.addEventListener('click', handleQuantityChange);
    dom.checkoutButton.addEventListener('click', openCheckoutModal);
    dom.checkoutForm.addEventListener('submit', handleOrderSubmit);
    dom.searchBar.addEventListener('input', filterMenu);
    dom.adminPanelButton.addEventListener('click', openAdminPanel);
    dom.closeAdminModalButton.addEventListener('click', closeAdminPanel);
    dom.mobileMenuButton.addEventListener('click', () => { dom.mobileMenu.classList.remove('hidden'); document.body.style.overflow = 'hidden'; });
    dom.closeMobileMenuButton.addEventListener('click', () => { dom.mobileMenu.classList.add('hidden'); document.body.style.overflow = 'auto'; });
    dom.mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => link.addEventListener('click', () => { dom.mobileMenu.classList.add('hidden'); document.body.style.overflow = 'auto'; }));
    dom.contactForm.addEventListener('submit', handleContactSubmit);
    dom.applyCouponButton.addEventListener('click', () => 
    { isCouponApplied = true; updateCart(); });
    startHeroSlideshow();

    // メニューカテゴリ切り替え機能のイベントリスナー
    dom.menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            // すべてのメニューコンテンツを非表示にし、アクティブクラスを削除
            document.querySelectorAll('.menu-content').forEach(content => {
                content.classList.add('hidden'); 
                content.classList.remove('active');
            });
            
            // すべてのメニューボタンから、共通のactive-menu-buttonクラスと
            // 各カテゴリの色を制御するクラスを削除します
            dom.menuButtons.forEach(btn => {
                btn.classList.remove('active-menu-button'); // 既存の共通アクティブクラスを削除
                btn.classList.remove('japanese-active', 'indonesian-active', 'sweets-active', 'drinks-active'); // 各カテゴリの色クラスも削除
            });

            const targetMenuCategory = button.dataset.menu; 
            const targetMenuElement = document.getElementById(`${targetMenuCategory}-menu`);
            if (targetMenuElement) {
                targetMenuElement.classList.remove('hidden'); 
                targetMenuElement.classList.add('active'); 
            }
            
            // クリックされたボタンに、共通のアクティブクラスと、カテゴリ固有の色クラスを追加します
            button.classList.add('active-menu-button', `${targetMenuCategory}-active`); 
            
            dom.searchBar.value = '';
            filterMenu(); 
        });
    });

    // 初回ロード時に日本料理メニューをアクティブにする
    const initialButton = document.querySelector('.menu-button[data-menu="japanese"]');
    if (initialButton) {
        initialButton.click(); 
    }
});
