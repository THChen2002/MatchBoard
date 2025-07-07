import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { auth } from "./config.js";
import { getDocument, updateDocument, addDocument } from "./firestore.js";

// 初始化 Google Auth Provider
const provider = new GoogleAuthProvider();

// 認證狀態初始化標記
let authInitialized = false;

// 處理用戶登入後的 Firestore 資料同步
async function handleUserLogin(user) {
	try {
		const existingUser = await getDocument('users', user.uid);
		if (existingUser) {
			await updateDocument('users', user.uid, { lastLogin: new Date() });
		} else {
			const userData = {
				email: user.email,
				name: user.displayName || user.email.split('@')[0],
				photoURL: user.photoURL || '',
				permission: 'user',
				createdAt: new Date(),
				lastLogin: new Date()
			};
			await addDocument('users', userData, user.uid);
		}
	} catch (error) {
		console.error('處理用戶登入資料庫操作失敗:', error);
	}
}

// 建立通用導航按鈕
function createNavButton(id, text) {
	return $('<a>', {
		id: id,
		text: text,
		href: "javascript:void(0);",
		class: "cursor-pointer"
	});
}

// 建立 Google 登入按鈕
function createGoogleLoginButton(id) {
	return $('<button>', {
		id: id,
		type: "button",
		class: "nav-link-login",
		text: "登入"
	});
}

// 建立桌面版用戶下拉選單（只顯示頭貼，不顯示名字）
function createUserDropdown(photoURL) {
	const avatar = photoURL
		? `<img src="${photoURL}" alt="user" style="width:32px;height:32px;border-radius:50%;object-fit:cover;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.06);">`
		: `<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.06);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg></span>`;
	const user = auth.currentUser;
	const name = user && (user.displayName || (user.email ? user.email.split('@')[0] : '使用者'));
	const userInfo = `<div class="dropdown-user-info" style="display:flex;align-items:center;gap:10px;padding:1rem 1.5rem;border-bottom:1px solid #f3f4f6;background:#fff;"><span class="user-icon" style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">${avatar}</span><span style="font-weight:700;font-size:1rem;color:#ea580c;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block;vertical-align:middle;" title="${name || ''}">${name || ''}</span></div>`;
	const dropdown = $(
		`<div class="user-dropdown">
		  <button class="user-dropdown-btn" id="user-dropdown-btn">
			<span class="user-icon" style="display:inline-flex;align-items:center;margin-right:0;">${avatar}</span>
		  </button>
		  <div class="user-dropdown-menu" id="user-dropdown-menu">
			${userInfo}
			<a href="admin.html" class="user-dropdown-item" id="dropdown-admin">後台管理</a>
			<a href="javascript:void(0);" class="user-dropdown-item" id="dropdown-logout">登出</a>
		  </div>
		</div>`
	);
	return dropdown;
}

// 設定認證 UI 與選單互動
function setupAuthUI() {
	const navLinks = $(".nav-links");
	const mobileMenu = $(".mobile-menu");
	if (!navLinks.length) return;

	// 桌面與手機版登入/登出/管理後台按鈕
	const loginBtn = createGoogleLoginButton("login-btn");
	const logoutBtn = createNavButton("logout-btn", "登出");
	const adminBtn = createNavButton("admin-btn", "管理後台");
	adminBtn.attr('href', 'admin.html');
	adminBtn.addClass('text-yellow-300 hover:text-yellow-100 font-medium');
	loginBtn.addClass("auth-loading");
	logoutBtn.addClass("auth-loading");
	adminBtn.addClass("auth-loading");

	// 綁定桌面版登入/登出事件
	loginBtn.on("click", async () => {
		try {
			const result = await signInWithPopup(auth, provider);
			await handleUserLogin(result.user);
		} catch (err) {
			console.error('登入失敗:', err);
		}
	});
	logoutBtn.on("click", () => {
		signOut(auth).catch(err => {
			console.error('登出失敗:', err);
		});
	});
	navLinks.append(loginBtn);
	navLinks.append(adminBtn);
	navLinks.append(logoutBtn);

	// 手機版按鈕
	let mLoginBtn, mLogoutBtn, mAdminBtn;
	if (mobileMenu.length) {
		mLoginBtn = createGoogleLoginButton("m-login-btn");
		mLogoutBtn = createNavButton("m-logout-btn", "登出");
		mAdminBtn = createNavButton("m-admin-btn", "管理後台");
		mAdminBtn.attr('href', 'admin.html');
		mLoginBtn.addClass("auth-loading");
		mLogoutBtn.addClass("auth-loading");
		mAdminBtn.addClass("auth-loading");
		mLoginBtn.on("click", async () => {
			try {
				const result = await signInWithPopup(auth, provider);
				await handleUserLogin(result.user);
			} catch (err) {
				console.error('手機版登入失敗:', err);
			}
		});
		mLogoutBtn.on("click", () => {
			signOut(auth).catch(err => {
				console.error('登出失敗:', err);
			});
		});
		mobileMenu.prepend(mLoginBtn);
		mobileMenu.append(mAdminBtn);
		mobileMenu.append(mLogoutBtn);
	}

	// 監聽認證狀態變化，動態切換選單
	onAuthStateChanged(auth, async user => {
		const isLoggedIn = !!user;
		$('.m-user-dropdown-subitems').remove();
		loginBtn.removeClass("auth-loading");
		logoutBtn.removeClass("auth-loading");
		adminBtn.removeClass("auth-loading");
		if (mLoginBtn && mLogoutBtn && mAdminBtn) {
			mLoginBtn.removeClass("auth-loading");
			mLogoutBtn.removeClass("auth-loading");
			mAdminBtn.removeClass("auth-loading");
		}
		loginBtn.toggle(!isLoggedIn);
		logoutBtn.toggle(false);
		adminBtn.toggle(false);
		let userDropdown = $(".user-dropdown");
		if (userDropdown.length) userDropdown.remove();
		if (isLoggedIn) {
			try {
				await getDocument('users', user.uid); // 僅同步 Firestore，不取 userName
				// 桌面版 user-dropdown
				const photoURL = user.photoURL || '';
				userDropdown = createUserDropdown(photoURL);
				navLinks.append(userDropdown);
				userDropdown.find('#user-dropdown-btn').on('click', function (e) {
					e.preventDefault();
					const menu = userDropdown.find('#user-dropdown-menu');
					menu.toggleClass('show');
				});
				$(document).on('click.userDropdown', function (e) {
					if (!$(e.target).closest('.user-dropdown').length) {
						userDropdown.find('#user-dropdown-menu').removeClass('show');
					}
				});
				userDropdown.find('#dropdown-logout').on('click', function () {
					signOut(auth).catch(err => {
						console.error('登出失敗:', err);
					});
				});
				// 手機版插入 user-info, admin, logout
				$('.mobile-menu .m-user-info, .mobile-menu .m-user-direct').remove();
				const mName = user.displayName || (user.email ? user.email.split('@')[0] : '使用者');
				const mAvatar = photoURL
					? `<img src="${photoURL}" alt="user" style="width:28px;height:28px;border-radius:50%;object-fit:cover;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.06);">`
					: `<span class="user-icon" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;background:#fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.06);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e1b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg></span>`;
				const userInfo = $(`<div class="m-user-info" style="display:flex;align-items:center;gap:10px;padding:1rem 1.5rem;border-bottom:1px solid #fb923c;background:#fff;">${mAvatar}<span style="font-weight:700;font-size:1rem;color:#ea580c;">${mName}</span></div>`);
				const admin = $('<a href="admin.html" class="user-dropdown-item m-user-direct">後台管理</a>');
				const logout = $('<a href="javascript:void(0);" class="user-dropdown-item m-user-direct">登出</a>');
				$('.mobile-menu').prepend(userInfo);
				$('.mobile-menu').append(admin, logout);
				logout.on('click', function () { signOut(auth).catch(err => { console.error('登出失敗:', err); }); });
				if (mLoginBtn && mLogoutBtn && mAdminBtn) {
					mLoginBtn.hide();
					mLogoutBtn.hide();
					mAdminBtn.hide();
				}
			} catch (err) {
				console.error('取得用戶名稱失敗:', err);
			}
		} else {
			if (userDropdown.length) userDropdown.remove();
			loginBtn.toggle(true);
			if (mLoginBtn && mLogoutBtn && mAdminBtn) {
				mLoginBtn.show();
				mLogoutBtn.hide();
				mAdminBtn.hide();
			}
			// 移除手機版所有登入後選項
			$('.m-user-dropdown-subitems, .m-user-info, .m-user-direct').remove();
		}
		authInitialized = true;
	});
}

// 初始化
$(document).ready(setupAuthUI); 