import { Pipe, PipeTransform } from '@angular/core';
import { API_URL } from '@core/utils/api';

@Pipe({
  name: 'publicUrl',
  standalone: true,
})
export class PublicUrlPipe implements PipeTransform {
  transform(path?: string | null): string | null {
    if (!path) return null;
    const trimmed = String(path).trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    // Normalize backslashes to forward slashes and remove leading slashes
    const normalized = trimmed.replace(/\\\\/g, '/').replace(/\\/g, '/').replace(/^\/+/, '');

    // Encode to handle spaces or special chars
    const encoded = encodeURI(normalized);

    return `${API_URL}/${encoded}`;
  }
}
