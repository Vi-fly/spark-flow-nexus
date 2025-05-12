// src/pages/api/email/send.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment variables
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('SMTP credentials missing in environment');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'SMTP credentials not configured'
    });
  }

  // Parse request body
  let payload;
  try {
    payload = JSON.parse(req.body);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  // Validate request body
  const { to, subject, text } = payload;
  if (!to || !subject || !text) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['to', 'subject', 'text']
    });
  }

  // Configure transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    // Send email
    const info = await transporter.sendMail({
      from: `"Spark Flow Nexus" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html: text.replace(/\n/g, '<br>'),
    });

    // Return success response
    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted
    });

  } catch (error: unknown) {
    console.error('Email send error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: (error instanceof Error) ? error.message : 'Unknown error',
      stack: import.meta.env.DEV  && error instanceof Error ? error.stack : undefined
    });
  }
}