import express from 'express';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to save data to Google Sheets
app.post('/api/sheets/save', async (req, res) => {
  try {
    const data = req.body;
    
    // In a real application, you would use a Service Account.
    // For this preview environment, we'll simulate the save if credentials aren't provided,
    // or use them if they are set in the environment.
    const credentialsBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
    
    if (!credentialsBase64) {
      console.log('No Google Service Account credentials found. Simulating save:', data);
      return res.json({ success: true, message: 'Simulated save (no credentials configured)' });
    }

    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1piDdtFLVRjl_a16788Kh86cQsVrlJoVibefVf5wNzQA';

    // Convert data object to an array of values based on the expected columns
    // We'll just append the raw values for now in the order they are defined
    const values = [Object.values(data)];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Página1!A:Z', // Adjust range as needed
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    res.json({ success: true, message: 'Despesa lançada com sucesso' });
  } catch (error: any) {
    console.error('Error saving to Google Sheets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
