🧩 How to Use:

Save these as:

index.html

style.css

Place your CV file in the same folder and name it JohnDoeCV.pdf
(or change the filename in the HTML link).

Replace the placeholder images in the gallery with your own project screenshots.



To Set Up EmailJS

// Initialize EmailJS
      (function () {
        emailjs.init("HlSZtObBKTuKIS-1g"); // Replace with your EmailJS public key
      })();

      // Handle contact form
      document
        .getElementById("contact-form")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          emailjs.sendForm("service_jvisxob", "template_1qvxn0n", this).then(
            () => {
              status.textContent = "✅ Message sent successfully!";
              this.reset();
            },
            (error) => {
              console.log(error);
              status.textContent =
                "❌ Failed to send message. Please try again.";
            }
          );
        });

Go to https://www.emailjs.com/
Create a free account.

Add your email service (like Gmail).

Create a template (use fields: from_name, reply_to, message).
Copy your:

Public Key

Service ID

Template ID

Replace them in this line of code: