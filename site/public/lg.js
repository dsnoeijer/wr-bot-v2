const userForm = document.getElementById("loginForm");

userForm.addEventListener("submit", submitForm);

function submitForm(e) {
    e.preventDefault();
    const userName = document.getElementById("username").value;

    let user = {
        username: userName
    };

    fetch('http://localhost:3000/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(user)
    })
        .then((res) => {
            if (res.status === 201) {
                window.location.replace("/add");
            }
            form.reset();
            // msg.innerHTML = "<p>Question has been added to the database!</p>";
            // setTimeout(() => {
            //     msg.innerHTML = "";
            // }, 3000);
        })
        .catch((err) => {
            msg.innerHTML = "<p>Wrong username</p>";
        });
}