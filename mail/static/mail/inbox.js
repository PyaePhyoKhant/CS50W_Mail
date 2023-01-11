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
    .then(_ => {
        load_mailbox('sent');
    });

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

function load_email_detail(mail_id, allow_archive) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-detail').style.display = 'block';

  // GET email and render DOM
  fetch('/emails/' + mail_id)
  .then(response => response.json())
  .then(email => {
      const root_view = document.querySelector('#emails-detail');
      root_view.innerHTML = ''

      // reply button
      // TODO: add click EventListener
      const reply_button = document.createElement('button')
      reply_button.classList.add('btn')
      reply_button.classList.add('btn-sm')
      reply_button.classList.add('btn-outline-primary')
      reply_button.setAttribute('id', 'reply')
      reply_button.innerHTML = 'Reply'

      if (allow_archive) {
        // archive/unarchive button
        const archive_button = document.createElement('button')
        archive_button.classList.add('btn')
        archive_button.classList.add('btn-sm')
        archive_button.classList.add('btn-outline-primary')
        archive_button.setAttribute('id', 'archive')
        let archive_flag;
        if (email['archived']) {
          archive_button.innerHTML = 'Unarchive';
          archive_flag = false;
        } else {
          archive_button.innerHTML = 'Archive';
          archive_flag = true;
        }
        archive_button.addEventListener('click', function() {
          fetch('/emails/' + mail_id, {
            method: 'PUT',
            body: JSON.stringify({
                archived: archive_flag
            })
          })
          .then(_ => load_mailbox('inbox'))
        })
  
        root_view.insertAdjacentElement('beforeend', archive_button);
      }

      root_view.insertAdjacentHTML('beforeend', `
        <br>
        <b>From: </b>${email['sender']}<br>
        <b>To: </b>${email['recipients']}<br>
        <b>Subject: </b>${email['subject']}<br>
        <b>Timestamp: </b>${email['timestamp']}<br>
      `)

      root_view.insertAdjacentElement('beforeend', reply_button);

      root_view.insertAdjacentHTML('beforeend', `
        <hr>
        ${email['body']}
      `)
  });

  // mark as read
  fetch('/emails/' + mail_id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
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
        
        if (item['read']) {
          new_row.classList.add('bg-secondary');
        } else {
          new_row.classList.add('bg-white');
        }
        
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

        // archive feature is not available for sent mailbox
        let allow_archive = true;
        if (mailbox === 'sent') {
          allow_archive = false
        }

        new_row.addEventListener('click', function() {
          load_email_detail(item['id'], allow_archive);
        })

        emails_view.append(new_row);
      });
  });
  }