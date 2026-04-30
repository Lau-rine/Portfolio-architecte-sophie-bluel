let allWorks = [];

async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    allWorks = await response.json();
    displayWorks(allWorks);
}

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    for (const work of works) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    }
}

async function getCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    displayFilters(categories);
}

function displayFilters(categories) {
    const filtersDiv = document.querySelector(".filters");

    // Bouton "Tous"
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("active");
    btnAll.addEventListener("click", () => {
        setActiveButton(btnAll);
        displayWorks(allWorks);
    });
    filtersDiv.appendChild(btnAll);

    // Boutons par catégorie
    for (const category of categories) {
        const btn = document.createElement("button");
        btn.textContent = category.name;
        btn.addEventListener("click", () => {
            setActiveButton(btn);
            const filtered = allWorks.filter(work => work.categoryId === category.id);
            displayWorks(filtered);
        });
        filtersDiv.appendChild(btn);
    }
}

function setActiveButton(activeBtn) {
    document.querySelectorAll(".filters button").forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}

getWorks();
getCategories();

// vérifie si on est connecté
function checkLogin() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = token.split(".")[1];
    const donnees = JSON.parse(atob(payload));
    if (donnees.exp * 1000 < Date.now()) return;

    // affiche le bandeau 
    document.getElementById("edit-banner").style.display = "flex";

    // affiche le bouton modifier
    document.getElementById("edit-btn").style.display = "inline";

    // cacher les filtres
    document.querySelector(".filters").style.display = "none";

    // remplacer "login" par "logout"
    const loginLink = document.querySelector('nav ul li a[href="./login.html"]');
    loginLink.parentElement.innerHTML = '<a href="#" id="logout-btn">logout</a>';

    // logout supprime token
    document.getElementById("logout-btn").addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "./index.html";
    });
}

checkLogin();


// MODALE
document.getElementById("edit-btn").addEventListener("click", function () {
    document.getElementById("modal").style.display = "flex";
    // toujours revenir a la vue galerie
    document.getElementById("modal-galerie").style.display = "block";
    document.getElementById("modal-ajout").style.display = "none";
    // reset le formulaire
    document.getElementById("form-ajout").reset();
    document.getElementById("photo-preview").querySelector("i").style.display = "";
    document.getElementById("photo-preview").querySelector(".btn-add-img").style.display = "";
    document.getElementById("photo-preview").querySelector(".photo-info").style.display = "";
    var ancienneImg = document.getElementById("photo-preview").querySelector("img");
    if (ancienneImg) ancienneImg.remove();

    displayModalGallery();
});

// fermer avec la croix
document.getElementById("close-modal").addEventListener("click", function () {
    document.getElementById("modal").style.display = "none";
});

// fermer en cliquant en dehors de la modale
document.getElementById("modal").addEventListener("click", function (e) {
    if (e.target.id === "modal") {
        document.getElementById("modal").style.display = "none";
    }
});

// remplir la modale avec les photos
function displayModalGallery() {
    const modalGallery = document.querySelector(".modal-gallery");
    modalGallery.innerHTML = "";

    for (const work of allWorks) {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        // bouton poubelle pour supprimer
        const trashBtn = document.createElement("button");
        trashBtn.classList.add("trash-icon");
        trashBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        trashBtn.addEventListener("click", async function () {
            const token = localStorage.getItem("token");
            const reponse = await fetch("http://localhost:5678/api/works/" + work.id, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });

            if (reponse.ok) {
                // on re-recupere la liste depuis le serveur pour etre a jour
                await getWorks();
                displayModalGallery();
            }
        });

        figure.appendChild(img);
        figure.appendChild(trashBtn);
        modalGallery.appendChild(figure);
    }
}

// basculer vers la vue ajout photo
document.getElementById("btn-ajout-photo").addEventListener("click", function () {
    document.getElementById("modal-galerie").style.display = "none";
    document.getElementById("modal-ajout").style.display = "block";
    remplirCategories();
});

// revenir a la vue galerie
document.getElementById("back-modal").addEventListener("click", function () {
    document.getElementById("modal-ajout").style.display = "none";
    document.getElementById("modal-galerie").style.display = "block";
});

// remplir le select des categories
async function remplirCategories() {
    const select = document.getElementById("categorie-photo");
    if (select.options.length > 0) return; // deja rempli
    const reponse = await fetch("http://localhost:5678/api/categories");
    const categories = await reponse.json();
    for (const cat of categories) {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    }
}

// previsualiser l'image choisie / cacher preview
document.getElementById("photo-input").addEventListener("change", function () {
    const fichier = this.files[0];
    if (fichier) {
        const preview = document.getElementById("photo-preview");
        // cache 
        preview.querySelector("i").style.display = "none";
        preview.querySelector(".btn-add-img").style.display = "none";
        preview.querySelector(".photo-info").style.display = "none";

        // enleve  ancienne preview 
        const ancienneImg = preview.querySelector("img");
        if (ancienneImg) ancienneImg.remove();

        //  ajoute la nouvelle preview
        const img = document.createElement("img");
        img.src = URL.createObjectURL(fichier);
        preview.appendChild(img);
    }
});

// envoyer le formulaire
document.getElementById("form-ajout").addEventListener("submit", async function (e) {
    e.preventDefault();
    const erreur = document.getElementById("form-error");
    const fichier = document.getElementById("photo-input").files[0]; 
    const titre = document.getElementById("titre-photo").value;
    const categorie = document.getElementById("categorie-photo").value;

console.log (fichier , titre , categorie, )

    // verifier que tout est rempli
    if (!fichier || !titre || !categorie) {
        erreur.textContent = "Merci de remplir tous les champs";
        return;
    }

    const formData = new FormData();
    formData.append("image", fichier);
    formData.append("title", titre);
    formData.append("category", categorie);

    const token = localStorage.getItem("token");
    const reponse = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token },
        body: formData
    });

    if (reponse.ok) {
            // on re-recupere la liste depuis le serveur
            await getWorks();
            displayModalGallery();

        // revenir a la galerie et reset le formulaire
        document.getElementById("modal-ajout").style.display = "none";
        document.getElementById("modal-galerie").style.display = "block";
        document.getElementById("form-ajout").reset();
        // remettre la preview comme au debut
        var preview = document.getElementById("photo-preview");
        preview.querySelector("i").style.display = "";
        preview.querySelector(".btn-add-img").style.display = "";
        preview.querySelector(".photo-info").style.display = "";
        var ancienneImg = preview.querySelector("img");
        if (ancienneImg) ancienneImg.remove();
    } else {
        erreur.textContent = "Erreur lors de l'envoi";
    }
});