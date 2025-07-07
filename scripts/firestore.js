import {
	collection,
	addDoc,
	getDocs,
	getDoc,
	doc,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { db } from "./config.js";

// ===== CRUD 操作 =====

// CREATE - 新增文件
export async function addDocument(collectionName, data, documentId = null) {
	try {
		let docRef;
		let resultId;
		
		if (documentId) {
			// 使用自定義 ID
			docRef = doc(db, collectionName, documentId);
			await setDoc(docRef, data);
			resultId = documentId;
		} else {
			// 讓 Firestore 自動生成 ID
			docRef = await addDoc(collection(db, collectionName), data);
			resultId = docRef.id;
		}
		
		return resultId;
	} catch (error) {
		console.error("新增文件時發生錯誤: ", error);
		throw error;
	}
}

// READ - 讀取所有文件
export async function getAllDocuments(collectionName) {
	try {
		const querySnapshot = await getDocs(collection(db, collectionName));
		const documents = [];
		querySnapshot.forEach((doc) => {
			documents.push({
				id: doc.id,
				...doc.data()
			});
		});
		return documents;
	} catch (error) {
		console.error("讀取文件時發生錯誤: ", error);
		throw error;
	}
}

// READ - 讀取單一文件
export async function getDocument(collectionName, documentId) {
	try {
		const docRef = doc(db, collectionName, documentId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return {
				id: docSnap.id,
				...docSnap.data()
			};
		} else {
			return null;
		}
	} catch (error) {
		console.error("讀取文件時發生錯誤: ", error);
		throw error;
	}
}

// READ - 根據條件查詢文件
export async function queryDocuments(collectionName, field, operator, value) {
	try {
		const q = query(collection(db, collectionName), where(field, operator, value));
		const querySnapshot = await getDocs(q);
		const documents = [];
		querySnapshot.forEach((doc) => {
			documents.push({
				id: doc.id,
				...doc.data()
			});
		});
		return documents;
	} catch (error) {
		console.error("查詢文件時發生錯誤: ", error);
		throw error;
	}
}

// UPDATE - 更新文件
export async function updateDocument(collectionName, documentId, updateData) {
	try {
		const docRef = doc(db, collectionName, documentId);
		await updateDoc(docRef, updateData);
		return true;
	} catch (error) {
		console.error("更新文件時發生錯誤: ", error);
		throw error;
	}
}

// DELETE - 刪除文件
export async function deleteDocument(collectionName, documentId) {
	try {
		await deleteDoc(doc(db, collectionName, documentId));
		return true;
	} catch (error) {
		console.error("刪除文件時發生錯誤: ", error);
		throw error;
	}
}
