import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import {
  collection,
  addDoc,
  deleteDoc,
  doc as firestoreDoc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Attachment, Transaction } from "../types";

const storage = getStorage();
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds maximum limit of ${
      MAX_FILE_SIZE / 1024 / 1024
    }MB`;
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "File type not allowed";
  }

  return null;
};

export const getAttachmentsByTransaction = async (
  transactionId: string
): Promise<Attachment[]> => {
  const attachmentsRef = collection(db, "attachments");
  const q = query(attachmentsRef, where("transaction.id", "==", transactionId));
  const querySnapshot = await getDocs(q);

  const attachments: Attachment[] = [];
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    // Fetch transaction data
    const transactionDoc = await getDoc(firestoreDoc(db, "transactions", transactionId));

    attachments.push({
      id: doc.id,
      transaction: {
        id: transactionId,
        ...transactionDoc.data(),
      } as Transaction,
      fileName: data.fileName,
      fileType: data.fileType,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      uploadedAt: data.uploadedAt,
    });
  }

  return attachments.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
};

export const getAttachment = async (
  attachmentId: string
): Promise<Attachment | null> => {
  const attachmentDoc = await getDoc(firestoreDoc(db, "attachments", attachmentId));

  if (!attachmentDoc.exists()) {
    return null;
  }

  const data = attachmentDoc.data();
  const transactionDoc = await getDoc(
    firestoreDoc(db, "transactions", data.transaction.id)
  );

  return {
    id: attachmentDoc.id,
    transaction: {
      id: data.transaction.id,
      ...transactionDoc.data(),
    } as Transaction,
    fileName: data.fileName,
    fileType: data.fileType,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize,
    uploadedAt: data.uploadedAt,
  };
};

export const uploadAttachment = async (
  transactionId: string,
  file: File
): Promise<Attachment> => {
  // Validate file
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    // Create a unique filename to prevent collisions
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(
      storage,
      `attachments/${transactionId}/${uniqueFileName}`
    );

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const fileUrl = await getDownloadURL(storageRef);

    // Get transaction data
    const transactionDoc = await getDoc(firestoreDoc(db, "transactions", transactionId));
    if (!transactionDoc.exists()) {
      throw new Error("Transaction not found");
    }

    // Create attachment document
    const attachment: Omit<Attachment, "id"> = {
      transaction: {
        id: transactionId,
        ...transactionDoc.data(),
      } as Transaction,
      fileName: file.name,
      fileType: file.type,
      fileUrl,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };

    const attachmentRef = await addDoc(
      collection(db, "attachments"),
      attachment
    );

    return { id: attachmentRef.id, ...attachment };
  } catch (error) {
    console.error("Error uploading attachment:", error);
    throw new Error("Failed to upload attachment");
  }
};

export const uploadMultipleAttachments = async (
  transactionId: string,
  files: File[]
): Promise<Attachment[]> => {
  const attachments: Attachment[] = [];

  for (const file of files) {
    try {
      const attachment = await uploadAttachment(transactionId, file);
      attachments.push(attachment);
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      // Continue with next file instead of stopping the entire process
    }
  }

  return attachments;
};

export const deleteAttachment = async (
  attachment: Attachment
): Promise<void> => {
  try {
    // Delete from storage
    const storageRef = ref(storage, attachment.fileUrl);
    await deleteObject(storageRef);

    // Delete from Firestore
    await deleteDoc(firestoreDoc(db, "attachments", attachment.id));
  } catch (error) {
    console.error("Error deleting attachment:", error);
    throw new Error("Failed to delete attachment");
  }
};

export const deleteAllTransactionAttachments = async (
  transactionId: string
): Promise<void> => {
  try {
    // Get all attachments for the transaction
    const attachments = await getAttachmentsByTransaction(transactionId);

    // Delete each attachment
    const deletePromises = attachments.map((attachment) =>
      deleteAttachment(attachment)
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting transaction attachments:", error);
    throw new Error("Failed to delete transaction attachments");
  }
};

export const updateAttachmentMetadata = async (
  attachmentId: string,
  updates: Partial<Pick<Attachment, "fileName">>
): Promise<void> => {
  const attachmentRef = firestoreDoc(db, "attachments", attachmentId);
  await updateDoc(attachmentRef, updates);
};
