
/**
 * Flowternity - Google Sheets Integration
 */

export async function submitToGoogleSheets(formData, formType) {
  try {
    const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK;

    if (!WEBHOOK_URL) {
      throw new Error('Google Sheets webhook is not configured');
    }

    const payload = {
      ...formData,
      formType,
      submittedAt: new Date().toISOString(),
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || 'Google Sheets submission failed'
      );
    }

    console.log('Google Sheets submission successful:', formType);

    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error('Google Sheets submission error:', error);

    return {
      success: false,
      error: error.message || 'Failed to submit to Google Sheets',
    };
  }
}
