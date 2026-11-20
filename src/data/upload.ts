import { USE_MOCKS } from '@/config';
import { api } from '@/lib/api';

export type UploadPurpose = 'package-photo' | 'signature';

export interface UploadedFile {
  /** O que vai para photoUrl/signatureUrl ao salvar (chave no storage; nos dados de exemplo, a própria data URL). */
  key: string;
  /** Para exibir agora (URL assinada de 15 min na API). */
  url: string;
}

/** Envia uma imagem (data URL) como foto da encomenda ou assinatura. */
export async function uploadFile(dataUrl: string, purpose: UploadPurpose): Promise<UploadedFile> {
  if (USE_MOCKS) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return { key: dataUrl, url: dataUrl };
  }
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append('purpose', purpose);
  form.append('file', blob, purpose === 'signature' ? 'assinatura.png' : 'foto.jpg');
  return api<UploadedFile>('/uploads', { form });
}
