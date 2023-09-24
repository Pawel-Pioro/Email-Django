document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#submit-form').addEventListener('click', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
      //emails = JSON.stringify(emails);
      emails.forEach(email => {
        const element = document.createElement('div');
        element.className = "border p-2 container";
        element.style.cursor = "pointer";
        if (email["read"] == true){
          element.style.backgroundColor = "lightgrey";
        };
        const rowDiv = document.createElement('div');
        rowDiv.className = "row justify-content-between";
        element.append(rowDiv);
        
        const div1 = document.createElement('div');
        div1.className = 'col-4';
        div1.innerHTML = `<strong>${email["sender"]}</strong> ${email["subject"]}`;
        rowDiv.append(div1);

        const div2 = document.createElement('div');
        div2.className = 'col-4';
        div2.innerHTML = `${email["timestamp"]}`;
        rowDiv.append(div2);

        element.addEventListener('click', function() {
          // code to show email contents 
          element.remove();
          document.querySelector('#emails-view').innerHTML =
          `<h3>${email["subject"]}</h3><br> <p style="line-height: 5px"><strong>From:</strong> ${email["sender"]}</p>
          <p style="line-height: 5px"><strong>To:</strong> ${email["recipients"]}</p>
          <p style="line-height: 5px"><strong>Time:</strong> ${email["timestamp"]}</p>
          <hr> ${email["body"]}<br><hr>`;
          fetch('/emails/'+email["id"], {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
          
          // shows back to inbox link
          document.querySelector("#emails-view").innerHTML += `<a href="">Back to inbox</a><br>`;

          // reply button
          const button = document.createElement('button');
          button.innerHTML = "Reply";
          button.className = "btn btn-secondary";
          button.setAttribute("id", "reply-button");
          button.addEventListener('click', function(){
            console.log("run");
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
            subjectValue = email["subject"];
            if (email["subject"].startsWith("Re:") == false){
              subjectValue = "Re: " + email["subject"];
            }

            document.querySelector('#compose-recipients').value = email["sender"];
            document.querySelector('#compose-subject').value = subjectValue;
            document.querySelector('#compose-body').value = `On ${email["timestamp"]} ${email["sender"]} wrote: ${email["body"]}`;
          });

          document.querySelector("#emails-view").append(button);

          // makes the archive/unarchive buttons
          if (mailbox != "sent"){
            if (email["archived"] == true){
              const unarchive = document.createElement('a');
              unarchive.innerHTML = '<br>Unarchive';
              unarchive.href = "";
              unarchive.addEventListener('click', function() {
                fetch('/emails/'+email["id"], {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: false
                  })
                })
              });
              document.querySelector("#emails-view").append(unarchive);
            }
            else{
              const archive = document.createElement('a');
              archive.innerHTML = '<br>Archive';
              archive.href = "";
              archive.addEventListener('click', function() {
                fetch('/emails/'+email["id"], {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: true
                  })
                })
              });
              document.querySelector("#emails-view").append(archive);
            }
          }
        });
        document.querySelector('#emails-view').append(element);
      });
  });
}

function send_email(){
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox("sent");
  });
}