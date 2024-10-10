import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    console.log('Received contact form submission')
    const { name, email, message } = await request.json()
    console.log('Form data:', { name, email, message })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_SEND_TO,
      subject: `New contact form submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    }
    console.log('Mail options set')

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.response)
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 })
  } catch (error) {
    console.error('Failed to send email:', error)
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Failed to send email', error: error.message }, { status: 500 })
    } else {
      return NextResponse.json({ message: 'Failed to send email', error: 'An unknown error occurred' }, { status: 500 })
    }
  }
}