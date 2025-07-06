import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { auth } from "./config.js";

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// 認證狀態初始化標記
let authInitialized = false;

// 創建登出確認對話框
function createLogoutModal() {
	const modal = $('<div>', {
		class: 'logout-modal',
		id: 'logout-modal'
	}).html(`
		<div class="logout-modal-content">
			<div class="logout-modal-header">
			<div class="logout-modal-icon">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z">
				</path>
				</svg>
			</div>
			<h3 class="logout-modal-title">確認登出</h3>
			<p class="logout-modal-message">您確定要登出嗎？登出後將需要重新登入才能使用管理功能。</p>
			</div>
			<div class="logout-modal-actions">
			<button class="logout-modal-btn logout-modal-btn-cancel" id="logout-cancel">取消</button>
			<button class="logout-modal-btn logout-modal-btn-confirm" id="logout-confirm">確定登出</button>
			</div>
		</div>
	`);

	$('body').append(modal);

	// 綁定事件
	$('#logout-cancel').on('click', hideLogoutModal);
	$('#logout-confirm').on('click', confirmLogout);

	// 點擊背景關閉
	modal.on('click', function (e) {
		if (e.target === this) {
			hideLogoutModal();
		}
	});

	// ESC鍵關閉
	$(document).on('keydown', function (e) {
		if (e.key === 'Escape' && $('#logout-modal').hasClass('show')) {
			hideLogoutModal();
		}
	});
}

// 顯示登出確認對話框
function showLogoutModal() {
	const modal = $('#logout-modal');
	if (modal.length) {
		modal.addClass('show');
		$('body').css('overflow', 'hidden'); // 防止背景滾動
	}
}

// 隱藏登出確認對話框
function hideLogoutModal() {
	const modal = $('#logout-modal');
	if (modal.length) {
		modal.removeClass('show');
		$('body').css('overflow', ''); // 恢復滾動
	}
}

// 確認登出
function confirmLogout() {
	hideLogoutModal();
	signOut(auth).catch(err => {
		console.error('登出失敗:', err);
	});
}

// 創建導航按鈕
function createNavButton(id, text) {
	return $('<a>', {
		id: id,
		text: text,
		href: "javascript:void(0);",
		class: "cursor-pointer"
	});
}

// 建立 Google 風格登入按鈕
function createGoogleLoginButton(id) {
	return $('<button>', {
		id: id,
		type: "button",
		class: "nav-link-login",
		text: "登入"
	});
}

// 設置認證 UI
function setupAuthUI() {
	const navLinks = $(".nav-links");
	const mobileMenu = $(".mobile-menu");

	if (!navLinks.length) return; // Navigation not found

	// 創建登出確認對話框
	createLogoutModal();

	// Desktop buttons
	const loginBtn = createGoogleLoginButton("login-btn");
	const logoutBtn = createNavButton("logout-btn", "登出");
	const adminBtn = createNavButton("admin-btn", "管理後台");

	adminBtn.attr('href', 'admin.html');
	adminBtn.addClass('text-yellow-300 hover:text-yellow-100 font-medium');

	// 添加 CSS 類別來控制可見性
	loginBtn.addClass("auth-loading");
	logoutBtn.addClass("auth-loading");
	adminBtn.addClass("auth-loading");

	// 綁定桌面版按鈕事件
	loginBtn.on("click", () => {
		signInWithPopup(auth, provider).catch(err => {
			// Handle login error silently or show user-friendly message
		});
	});

	logoutBtn.on("click", () => {
		showLogoutModal();
	});

	// 添加桌面版按鈕到導航
	navLinks.append(loginBtn);
	navLinks.append(adminBtn);
	navLinks.append(logoutBtn);

	// Mobile buttons (if mobile menu exists)
	if (mobileMenu.length) {
		const mLoginBtn = createGoogleLoginButton("m-login-btn");
		const mLogoutBtn = createNavButton("m-logout-btn", "登出");
		const mAdminBtn = createNavButton("m-admin-btn", "管理後台");

		mAdminBtn.attr('href', 'admin.html');

		// 添加 CSS 類別來控制手機版按鈕可見性
		mLoginBtn.addClass("auth-loading");
		mLogoutBtn.addClass("auth-loading");
		mAdminBtn.addClass("auth-loading");

		// 綁定手機版按鈕事件
		mLoginBtn.on("click", () => {
			signInWithPopup(auth, provider).catch(err => {
				// Handle mobile login error silently
			});
		});

		mLogoutBtn.on("click", () => {
			showLogoutModal();
		});

		// 添加手機版按鈕到選單
		mobileMenu.append(mLoginBtn);
		mobileMenu.append(mAdminBtn);
		mobileMenu.append(mLogoutBtn);
	}

	// 監聽認證狀態變化
	onAuthStateChanged(auth, user => {
		const isLoggedIn = !!user;

		// 移除載入狀態並更新按鈕顯示
		loginBtn.removeClass("auth-loading");
		logoutBtn.removeClass("auth-loading");
		adminBtn.removeClass("auth-loading");

		loginBtn.toggle(!isLoggedIn);
		logoutBtn.toggle(isLoggedIn);
		adminBtn.toggle(isLoggedIn);

		// 更新手機版按鈕
		const mLogin = $("#m-login-btn");
		const mLogout = $("#m-logout-btn");
		const mAdmin = $("#m-admin-btn");

		if (mLogin.length && mLogout.length) {
			mLogin.removeClass("auth-loading");
			mLogout.removeClass("auth-loading");
			mLogin.toggle(!isLoggedIn);
			mLogout.toggle(isLoggedIn);
		}

		if (mAdmin.length) {
			mAdmin.removeClass("auth-loading");
			mAdmin.toggle(isLoggedIn);
		}

		// 標記認證狀態已初始化
		authInitialized = true;
	});
}

// 當 DOM 載入完成後初始化
$(document).ready(setupAuthUI); 