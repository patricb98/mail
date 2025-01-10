document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Add event listener for form submission
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {
  event.preventDefault();

  // Get the form data
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send the email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    // Check json response
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    // Send Success
    .then(result => {
      console.log("Email sent successfully:", result);
      load_mailbox('sent'); 
    })
    // Send Error
    .catch(error => {
      console.error("Error sending email:", error);
    });
  };

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch mailbox emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    console.log(emails)
      // Store hmtl element in a variable
      const emails_view = document.querySelector('#emails-view');
      // Map each email data to the inbox html template
      emails_view.innerHTML += emails.map(email=> create_email_div(email)).join('');
  });
}

function create_email_div(email) {
  
  // Determine if each email has been read or not for css colouring
  const email_class = email.read ? 'email read' : 'email unread';
  
  // Inbox email html template
  return `<div class="${email_class}" onclick="view_email(${email.id})">
            <b> ${email.sender}</b> ${email.subject}
            <span class="timestamp">${email.timestamp}</span>
          </div>`;
}

function view_email(email_id) {

  // Show mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Fetch email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Store html element in a variable
    const email_view = document.querySelector('#email-view');

    // Update element variable to view email html template
    email_view.innerHTML = `
      <h3>${email.subject}</h3>
      <p><b>From:</b> ${email.sender}</p>
      <p><b>To:</b> ${email.recipients.join(', ')}</p>
      <p><b>Timestamp:</b> ${email.timestamp}</p>
      <hr>
      <p>${email.body}</p>
    `;
    // Mark email as read
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    }).then();

    // Archive/unarchive button
    
    // Reply button
  });
}