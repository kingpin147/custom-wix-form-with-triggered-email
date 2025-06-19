import { webMethod, Permissions } from 'wix-web-module';
import { contacts, triggeredEmails } from 'wix-crm-backend';
import { priceMatching } from "backend/price.jsw";

export const sendQuoteEmailWithContact = webMethod(Permissions.Anyone, async ( name, email, businessType, turnover, vat, bookkeeping) => {
    try {
        
        console.log("🟨 Input received:", { name, email, businessType, turnover, vat, bookkeeping });

        // ✅ Validate input
        if (!name || !email) {
            throw new Error("Missing required fields: name or email.");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format.");
        }

        const match = await priceMatching(businessType, turnover, vat, bookkeeping);
        console.log(match);
        const price = match;
        console.log("💰 Matched price:", price);

        // 👤 Split name
        const [firstName, ...rest] = name.trim().split(" ");
        const lastName = rest.length > 0 ? rest.join(" ") : "";

        // 👥 Create contact
        const contactInfo = {
            name: { first: firstName, last: lastName },
            emails: [{ email, tag: "WORK", primary: true }]
        };

        const options = {
            allowDuplicates: true,
            suppressAuth: true
        };

        const contact = await contacts.createContact(contactInfo, options);
        const contactId = contact._id;

        if (!contactId) throw new Error("Failed to retrieve contact ID.");
            let newprice =String(price);
        // 📤 Send triggered email
        const emailResult = await triggeredEmails.emailContact("quoteConfirmationEmail", contactId, {
            variables: {
                service: businessType,
                turnover,
                vat,
                bookkeeping,
                price: newprice,
                SITE_URL: "https://www.simply-accounting.com/"
            }
        });

        console.log("📧 Email sent successfully.");
        return { success: true, message: "Email sent successfully.", result: emailResult };

    } catch (error) {
        console.error("❌ Error in sendQuoteEmailWithContact:", error);
        return { success: false, message: error.message || "Unable to send quote email." };
    }
});
