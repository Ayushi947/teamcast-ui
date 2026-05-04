import { toast } from 'sonner';

export interface FileValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ALLOWED_EXTENSIONS = ['.pdf'];

export const validateFileUpload = (
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult => {
  const {
    maxSizeInMB = DEFAULT_MAX_SIZE_MB,
    allowedExtensions = DEFAULT_ALLOWED_EXTENSIONS,
  } = options;

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    const errorMessage = `File size must be less than ${maxSizeInMB}MB`;
    toast.error(errorMessage);
    return { isValid: false, error: errorMessage };
  }

  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(fileExtension)) {
    const errorMessage = `Please upload a ${allowedExtensions.join(', ')} file only`;
    toast.error(errorMessage);
    return { isValid: false, error: errorMessage };
  }

  return { isValid: true };
};
