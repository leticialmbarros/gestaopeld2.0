export async function saveToGoogleSheets(data: any): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Use the provided Google Apps Script Web App URL
    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycby9PQee6TJMFKI98XJ1rVO2qGQ-vTGUzvx7zAkQxEN9Fob2pjpK4T6KcJSAxHZDO-cChw/exec';
    
    if (scriptUrl) {
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      try {
        // Use 'no-cors' mode for Google Apps Script Web Apps when called from a browser
        // This prevents CORS errors but makes the response opaque (unreadable)
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        // Since the response is opaque in no-cors mode, we assume success if fetch didn't throw a network error
        return { success: true, message: 'Despesa lançada com sucesso' };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('A requisição demorou muito para responder (Timeout). Verifique sua conexão ou a URL do script.');
        }
        throw fetchError;
      }
    }

    // Fallback to the local backend proxy (should not be reached now)
    const response = await fetch('/api/sheets/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error saving to Google Sheets:', error);
    return { success: false, error: error.message || 'Erro desconhecido ao salvar' };
  }
}
