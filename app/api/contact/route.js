
import { NextResponse } from 'next/server';
import { submitToGoogleSheets } from '@/lib/flowternity/google-sheets';

export const runtime = 'nodejs';

const VALID_FORM_TYPES = [
  'contact',
  'events',
  'schools',
  'corporate',
];

export async function POST(req) {
  try {
    // 1. Read request body
    const body = await req.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      subject,
      message,
      formType = 'contact',

      // Events
      eventType,
      attendees,
      date,
      details,

      // Schools
      schoolName,
      contactPerson,
      gradeLevels,
      sportsInterest,

      // Corporate
      companyName,
      employeeCount,
    } = body;

    // 2. Validate form type
    if (!VALID_FORM_TYPES.includes(formType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid form type',
        },
        { status: 400 }
      );
    }

    // 3. Validate required fields
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and email are required',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid email address',
        },
        { status: 400 }
      );
    }

    // 4. Prepare data based on form type
    let googleSheetsData;

    switch (formType) {

      case 'contact':
        googleSheetsData = {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone || '',
          subject: subject || 'General Enquiry',
          message: message || '',
        };
        break;

      case 'events':
        googleSheetsData = {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone || '',
          eventType: eventType || '',
          attendees: attendees || '',
          date: date || '',
          details: details || '',
        };
        break;

      case 'schools':
        googleSheetsData = {
          schoolName: schoolName || name,
          contactPerson: contactPerson || name,
          email: normalizedEmail,
          phone: phone || '',
          gradeLevels: gradeLevels || '',
          sportsInterest: sportsInterest || '',
          message: message || '',
        };
        break;

      case 'corporate':
        googleSheetsData = {
          companyName: companyName || '',
          contactPerson: contactPerson || name,
          email: normalizedEmail,
          phone: phone || '',
          employeeCount: employeeCount || '',
          eventType: eventType || '',
          date: date || '',
          message: message || '',
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported form type' },
          { status: 400 }
        );
    }

    // 5. Log submission (avoid logging personal information)
    console.log('Processing Flowternity enquiry:', {
      formType,
      timestamp: new Date().toISOString(),
    });

    // 6. Submit to Google Sheets
    const sheetsResult = await submitToGoogleSheets(
      googleSheetsData,
      formType
    );

    // 7. Verify Google Sheets submission
    if (!sheetsResult.success) {
      console.error(
        'Google Sheets submission failed:',
        sheetsResult.error
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Unable to save your enquiry. Please try again.',
        },
        { status: 502 }
      );
    }

    // 8. Return success only after Sheets confirms success
    console.log('Flowternity enquiry saved:', formType);

    return NextResponse.json(
      {
        success: true,
        message: 'Enquiry submitted successfully',
        formType,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Flowternity contact API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process your enquiry. Please try again.',
      },
      { status: 500 }
    );
  }
}
