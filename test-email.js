// Test EmailJS functionality
// Run this in browser console to test basic EmailJS setup

// Test function - paste this in browser console
import emailjs from "@emailjs/browser";

function testEmailJS() {
  console.log('🧪 Testing EmailJS configuration...');

  emailjs.send(
    'service_j5qmf84',  // Your service ID
    'template_kot9cu5', // Your template ID
    {
      to_email: 'test@example.com', // Replace with your email
      to_name: 'Test User',
      from_name: 'QuizBeheer Team',
      subject: 'Test Email',
      message: 'This is a test email from QuizBeheer',
      reply_to: 'test@quizbeheer.app'
    }
  ).then(
    (response) => {
      console.log('✅ Test email sent successfully!', response);
    },
    (error) => {
      console.error('❌ Test email failed:', error);
    }
  );
}

// Call the test function
testEmailJS();
