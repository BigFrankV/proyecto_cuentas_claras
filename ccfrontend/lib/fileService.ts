/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import api from './api';

export interface FileUploadOptions {
  comunidadId: number;
  entityType?: 'personas' | 'unidades' | 'gastos' | 'documentos' | 'reportes';
  entityId?: number;
  fileCategory?: string;
  description?: string | undefined;
}

export interface UploadedFile {
  id: number;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  category: string;
  url: string;
  uploadedAt?: string;
  description?: string;
}

export interface FileListItem extends UploadedFile {
  downloadUrl: string;
  previewUrl?: string;
  uploadedBy?: number;
  entityType?: string;
  entityId?: number;
}

export interface FileStats {
  total_files: number;
  total_size: number;
  totalSizeMB: number;
  personas_files: number;
  unidades_files: number;
  gastos_files: number;
  avatars: number;
  documentos: number;
  comprobantes: number;
}

class FileService {
  private baseUrl = '/files';

  /**
   * Subir archivos al servidor
   */
  async uploadFiles(
    files: FileList | File[],
    options: FileUploadOptions
  ): Promise<UploadedFile[]> {
    try {
      const formData = new FormData();

      // Agregar archivos
      const fileArray = Array.from(files);
      fileArray.forEach(file => {
        formData.append('files', file);
      });

      // Agregar opciones
      formData.append('comunidadId', options.comunidadId.toString());
      if (options.entityType) {
        formData.append('entityType', options.entityType);
      }
      if (options.entityId) {
        formData.append('entityId', options.entityId.toString());
      }
      if (options.fileCategory) {
        formData.append('fileCategory', options.fileCategory);
      }
      if (options.description) {
        formData.append('description', options.description);
      }

      const response = await api.post(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.files;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  /**
   * Subir un solo archivo
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions
  ): Promise<UploadedFile> {
    const files = await this.uploadFiles([file], options);
    if (files.length === 0) {
      throw new Error('No se pudo subir el archivo');
    }
    return files[0]!;
  }

  /**
   * Subir avatar de persona
   */
  async uploadAvatar(
    file: File,
    personaId: number,
    comunidadId: number
  ): Promise<UploadedFile> {
    return this.uploadFile(file, {
      comunidadId,
      entityType: 'personas',
      entityId: personaId,
      fileCategory: 'avatar',
      description: 'Avatar de usuario',
    });
  }

  /**
   * Subir documento de persona
   */
  async uploadPersonaDocument(
    file: File,
    personaId: number,
    comunidadId: number,
    description?: string
  ): Promise<UploadedFile> {
    return this.uploadFile(file, {
      comunidadId,
      entityType: 'personas',
      entityId: personaId,
      fileCategory: 'documentos',
      description,
    });
  }

  /**
   * Subir comprobante de pago
   */
  async uploadPaymentProof(
    file: File,
    entityType: 'personas' | 'unidades',
    entityId: number,
    comunidadId: number,
    description?: string
  ): Promise<UploadedFile> {
    return this.uploadFile(file, {
      comunidadId,
      entityType,
      entityId,
      fileCategory: 'comprobantes',
      description,
    });
  }

  /**
   * Obtener lista de archivos por contexto
   */
  async getFiles(
    options: {
      comunidadId?: number;
      entityType?: string;
      entityId?: number;
      category?: string;
    } = {}
  ): Promise<FileListItem[]> {
    try {
      const params = new URLSearchParams();

      if (options.entityType) {
        params.append('entityType', options.entityType);
      }
      if (options.entityId) {
        params.append('entityId', options.entityId.toString());
      }
      if (options.category) {
        params.append('category', options.category);
      }

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data.files;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting files:', error);
      throw error;
    }
  }

  /**
   * Obtener archivos de una persona específica
   */
  async getPersonaFiles(
    personaId: number,
    category?: string
  ): Promise<FileListItem[]> {
    const options: any = {
      entityType: 'personas',
      entityId: personaId,
    };
    if (category) {
      options.category = category;
    }
    return this.getFiles(options);
  }

  /**
   * Obtener archivos de una unidad específica
   */
  async getUnidadFiles(
    unidadId: number,
    category?: string
  ): Promise<FileListItem[]> {
    const options: any = {
      entityType: 'unidades',
      entityId: unidadId,
    };
    if (category) {
      options.category = category;
    }
    return this.getFiles(options);
  }

  /**
   * Obtener avatar de persona
   */
  async getPersonaAvatar(personaId: number): Promise<FileListItem | null> {
    const files = await this.getPersonaFiles(personaId, 'avatar');
    return files.length > 0 ? files[0]! : null;
  }

  /**
   * Descargar archivo
   */
  async downloadFile(fileId: number): Promise<Blob> {
    try {
      const response = await api.get(`${this.baseUrl}/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Obtener URL de descarga de archivo
   */
  getDownloadUrl(fileId: number): string {
    return `${api.defaults.baseURL}${this.baseUrl}/${fileId}`;
  }

  /**
   * Obtener URL de preview de archivo (para imágenes)
   */
  getPreviewUrl(fileId: number): string {
    return this.getDownloadUrl(fileId);
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(fileId: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${fileId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de archivos
   */
  async getStats(): Promise<FileStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data.stats;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting file stats:', error);
      throw error;
    }
  }

  /**
   * Limpiar archivos huérfanos (solo admin)
   */
  async cleanupOrphanFiles(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/cleanup`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error cleaning up files:', error);
      throw error;
    }
  }

  /**
   * Validar tipo de archivo
   */
  validateFileType(file: File, allowedTypes: string[] = []): boolean {
    if (allowedTypes.length === 0) {
      // Tipos por defecto
      allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-rar-compressed',
      ];
    }

    return allowedTypes.includes(file.type);
  }

  /**
   * Validar tamaño de archivo
   */
  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Obtener icono para tipo de archivo
   */
  getFileIcon(mimetype: string): string {
    if (mimetype.startsWith('image/')) {
      return 'image';
    }
    if (mimetype === 'application/pdf') {
      return 'picture_as_pdf';
    }
    if (mimetype.includes('word')) {
      return 'description';
    }
    if (mimetype.includes('excel') || mimetype.includes('sheet')) {
      return 'table_chart';
    }
    if (mimetype.includes('zip') || mimetype.includes('rar')) {
      return 'archive';
    }
    if (mimetype.startsWith('text/')) {
      return 'text_snippet';
    }
    return 'attach_file';
  }
}

export const fileService = new FileService();
export default fileService;
