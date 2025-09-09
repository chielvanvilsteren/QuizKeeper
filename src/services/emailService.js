// EmailJS service for sending emails
import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    this.templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    this.publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

    // Initialize EmailJS
    if (this.publicKey) {
      emailjs.init(this.publicKey);
    } else {
      console.warn('⚠️ EmailJS public key not found - emails will not be sent');
    }
  }

  isConfigured() {
    return !!(this.serviceId && this.templateId && this.publicKey);
  }

  async sendWelcomeEmail(userEmail, username) {
    if (!this.isConfigured()) {
      console.warn('Email service not configured, skipping welcome email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const templateParams = {
        to_email: userEmail,
        to_name: username,
        from_name: 'QuizBeheer Team',
        subject: 'Welkom bij QuizBeheer! 🎯',
        message: `
Hallo ${username},

Welkom bij QuizBeheer! Je account is succesvol aangemaakt en je kunt nu beginnen met het organiseren van geweldige pubquizzen.

Wat kun je allemaal doen met QuizBeheer:
🎯 Maak en beheer pubquizzen
👥 Organiseer teams en scores
📊 Houd real-time bij wie er wint
🏆 Genereer automatisch eindstanden

Ga naar de applicatie en log in om te beginnen!

Veel plezier met het organiseren van onvergetelijke quiz-avonden!

Met vriendelijke groet,
Het QuizBeheer Team

---
Dit is een automatisch gegenereerd bericht. Heb je vragen? Neem contact met ons op.
        `.trim(),
        reply_to: 'noreply@quizbeheer.app'
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      if (response.status === 200 || response.text === 'OK') {
        return { success: true, response };
      } else {
        return { success: false, error: `Unexpected response: ${response.text}` };
      }

    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }

  async sendPasswordResetEmail(userEmail, username, resetLink) {
    if (!this.isConfigured()) {
      console.warn('EmailJS not configured.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const templateParams = {
        to_email: userEmail,
        to_name: username,
        from_name: 'QuizBeheer Team',
        subject: 'Wachtwoord Herstellen - QuizBeheer',
        message: `
Hallo ${username},

Je hebt een verzoek ingediend om je wachtwoord te herstellen voor je QuizBeheer account.

Klik op de onderstaande link om je wachtwoord te wijzigen:
${resetLink}

Deze link is 24 uur geldig.

Heb je dit verzoek niet ingediend? Dan kun je deze email negeren.

Met vriendelijke groet,
Het QuizBeheer Team
        `.trim(),
        reply_to: 'noreply@quizbeheer.app'
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      return { success: true, response };

    } catch (error) {
      console.error('Failed to send password reset email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendQuizInvitation(userEmail, quizName, quizDate, location) {
    if (!this.isConfigured()) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const templateParams = {
        to_email: userEmail,
        from_name: 'QuizBeheer',
        subject: `Uitnodiging voor pubquiz: ${quizName}`,
        message: `
Je bent uitgenodigd voor een pubquiz!

Quiz: ${quizName}
Datum: ${quizDate}
Locatie: ${location}

Meld je aan via QuizBeheer en laat zien wat je kunt!

Veel succes!
        `.trim(),
        reply_to: 'noreply@quizbeheer.app'
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      return { success: true, response };

    } catch (error) {
      console.error('Failed to send quiz invitation:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendActivationEmail(userEmail, username, activationLink) {
    if (!this.isConfigured()) {
      console.warn('Email service not configured, skipping activation email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const templateParams = {
        to_email: userEmail,
        to_name: username,
        from_name: 'QuizBeheer Team',
        subject: 'Activeer je QuizBeheer account! 🔓',
        message: `
Hallo ${username},

Welkom bij QuizBeheer! Om je account te kunnen gebruiken, moet je eerst je email adres bevestigen.

Klik op de onderstaande link om je account te activeren:
${activationLink}

Deze link is 24 uur geldig.

Na activatie kun je:
🎯 Pubquizzen maken en beheren
👥 Teams organiseren en scores bijhouden
📊 Real-time resultaten bekijken
🏆 Automatische eindstanden genereren

Heb je deze registratie niet aangevraagd? Dan kun je deze email negeren.

Met vriendelijke groet,
Het QuizBeheer Team
        `.trim(),
        reply_to: 'noreply@quizbeheer.app',
        activation_link: activationLink
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams
      );

      if (response.status === 200 || response.text === 'OK') {
        return { success: true, response };
      } else {
        return { success: false, error: `Unexpected response: ${response.text}` };
      }

    } catch (error) {
      console.error('Failed to send activation email:', error.message);
      return { success: false, error: error.message || 'Failed to send activation email' };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
