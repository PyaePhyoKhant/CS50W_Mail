document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // send just composed new email
  document.querySelector('#compose-form').onsubmit = function() {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    });
    load_mailbox('sent');
    // to prevent page refresh
    return false;
  }
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // API call to respective mailbox
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
      emails_view = document.querySelector('#emails-view');
      emails.forEach(item => {
        const new_row = document.createElement('div');
        new_row.classList.add('row');
        new_row.classList.add('border');
        new_row.classList.add('border-dark');
        
        let new_col;

        new_col = document.createElement('div');
        new_col.classList.add('col-3');
        new_col.innerHTML = `<b>${item['sender']}</b>`;
        new_row.append(new_col);

        new_col = document.createElement('div');
        new_col.classList.add('col-6');
        new_col.innerHTML = `${item['subject']}`;
        new_row.append(new_col);

        new_col = document.createElement('div');
        new_col.classList.add('col-3');
        new_col.classList.add('text-right');
        new_col.innerHTML = `${item['timestamp']}`;
        new_row.append(new_col);

        new_row.addEventListener('click', function() {
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#emails-detail').style.display = 'block';
        })

        emails_view.append(new_row);
      });
  });
  }