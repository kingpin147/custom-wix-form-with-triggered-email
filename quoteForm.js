import { sendQuoteEmailWithContact } from 'backend/email.web';

$w.onReady(function () {
  $w("#quoteform").onSubmit(async (values) => {
    console.log("✅ Form is being submitted with values:", values);

    // Extract values from form
    const name = values.first_name; // or values.name depending on your input field name
    console.log(name);
    const email = values.email;
    const businessType = values.select_a_service;
    const turnover = values.turnover;
    const vat = values.vat_returns_required;
    const bookkeeping = values.bookkeeping_required;

    try {
      // Call the backend function
      const result = await sendQuoteEmailWithContact(name, email, businessType, turnover, vat, bookkeeping);
      console.log("✅ Email sent result:", result);
    } catch (error) {
      console.error("❌ Error sending email:", error);
    }
  });
});
