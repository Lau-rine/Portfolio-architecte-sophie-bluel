const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

// vérifie si y'a déjà un token stocké
const token = localStorage.getItem("token");

if (token) {
    // le token JWT c'est 3 parties séparées par des points, la 2e contient les données
    const payload = token.split(".")[1];

    //  décoder le base64 pour lire les infos
    const donnees = JSON.parse(atob(payload));

    //  compare la date d'expiration avec maintenant
    const maintenant = Date.now();
    if (donnees.exp * 1000 > maintenant) {
        // si c'est encore bon on redirige 
       window.location.href = "./index.html";
    }
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "./index.html";
        } else {
            errorMessage.textContent = "Erreur dans l'identifiant ou le mot de passe";
        }
    } catch (error) {
        errorMessage.textContent = "Erreur de communication avec le serveur";
    }
});