import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ error: 'Missing auth code' }, { status: 400 });
        }

        // In a real implementation:
        // 1. Exchange code for Account ID using Mono API
        // 2. Save Account ID to user's record or quote
        // 3. Initiate Direct Debit

        console.log('Received Mono Auth Code:', code);

        return NextResponse.json({ success: true, message: 'Mono connected successfully' });
    } catch (error) {
        console.error('Mono API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
