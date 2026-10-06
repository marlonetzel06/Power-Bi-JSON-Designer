/** Trigger a browser download of a text file. */
export function downloadText(filename: string, text: string, mime = 'application/json'): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Open a native file picker (single file or a directory). Resolves with the selected files. */
export function pickFiles(options: { accept?: string; directory?: boolean } = {}): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    if (options.accept) input.accept = options.accept;
    if (options.directory) {
      input.setAttribute('webkitdirectory', '');
      input.multiple = true;
    }
    input.style.display = 'none';
    input.onchange = () => {
      resolve(Array.from(input.files ?? []));
      input.remove();
    };
    input.oncancel = () => {
      resolve([]);
      input.remove();
    };
    document.body.appendChild(input);
    input.click();
  });
}
