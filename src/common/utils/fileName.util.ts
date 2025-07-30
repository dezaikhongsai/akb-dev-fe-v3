// Utility function để xử lý tên file tiếng Việt ở Frontend
export const sanitizeFileName = (fileName: string): string => {
  // Đảm bảo tên file được xử lý đúng encoding
  try {
    // Thử decode nếu fileName đã bị encode
    return decodeURIComponent(fileName);
  } catch {
    // Nếu không decode được, thử xử lý với Buffer
    try {
      // Tạo một TextDecoder để xử lý encoding
      const decoder = new TextDecoder('utf-8');
      const encoder = new TextEncoder();
      const bytes = encoder.encode(fileName);
      return decoder.decode(bytes);
    } catch {
      // Nếu vẫn không được, trả về nguyên bản
      return fileName;
    }
  }
};

// Function để lấy tên file an toàn từ File object
export const getSafeFileName = (file: File | { name: string }): string => {
  const fileName = file.name;
  return sanitizeFileName(fileName);
};

// Function để xử lý tên file khi hiển thị
export const displayFileName = (fileName: string): string => {
  return sanitizeFileName(fileName);
}; 